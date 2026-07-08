import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatusEnum } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private getDateRange(period: 'day' | 'week' | 'month' | 'year', date?: string) {
    const start = date ? new Date(date) : new Date();
    const end = new Date(start);

    switch (period) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start.setDate(start.getDate() - start.getDay());
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'year':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);
        break;
    }
    return { start, end };
  }

  async receivedEquipment(period: 'day' | 'week' | 'month' | 'year', date?: string) {
    const { start, end } = this.getDateRange(period, date);
    const orders = await this.prisma.serviceOrder.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { client: true, equipment: true, createdBy: true },
      orderBy: { createdAt: 'desc' },
    });
    return { period, start, end, total: orders.length, orders };
  }

  async deliveredEquipment(period: 'day' | 'week' | 'month' | 'year', date?: string) {
    const { start, end } = this.getDateRange(period, date);
    const orders = await this.prisma.serviceOrder.findMany({
      where: {
        status: OrderStatusEnum.ENTREGADO,
        deliveredAt: { gte: start, lte: end },
      },
      include: { client: true, equipment: true },
      orderBy: { deliveredAt: 'desc' },
    });
    return { period, start, end, total: orders.length, orders };
  }

  async pending() {
    const orders = await this.prisma.serviceOrder.findMany({
      where: {
        status: {
          notIn: [OrderStatusEnum.ENTREGADO, OrderStatusEnum.CANCELADO],
        },
      },
      include: { client: true, equipment: true, assignedTo: true },
      orderBy: { createdAt: 'desc' },
    });
    return { total: orders.length, orders };
  }

  async income(period: 'day' | 'week' | 'month' | 'year', date?: string) {
    const { start, end } = this.getDateRange(period, date);
    const orders = await this.prisma.serviceOrder.findMany({
      where: {
        status: OrderStatusEnum.ENTREGADO,
        deliveredAt: { gte: start, lte: end },
      },
      select: {
        orderNumber: true,
        finalCost: true,
        deliveredAt: true,
        client: { select: { name: true } },
      },
      orderBy: { deliveredAt: 'desc' },
    });

    const totalIncome = orders.reduce((sum, o) => sum + (o.finalCost || 0), 0);
    return { period, start, end, totalIncome, count: orders.length, orders };
  }

  async techProductivity(period: 'day' | 'week' | 'month' | 'year', date?: string) {
    const { start, end } = this.getDateRange(period, date);
    const users = await this.prisma.user.findMany({
      where: { role: 'TECNICO' },
      include: {
        ordersAssigned: {
          where: { createdAt: { gte: start, lte: end } },
          include: { client: true, equipment: true },
        },
      },
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      totalAssigned: u.ordersAssigned.length,
      completed: u.ordersAssigned.filter((o) => o.status === OrderStatusEnum.ENTREGADO).length,
      inProgress: u.ordersAssigned.filter(
        (o) => o.status !== OrderStatusEnum.ENTREGADO && o.status !== OrderStatusEnum.CANCELADO,
      ).length,
      orders: u.ordersAssigned,
    }));
  }

  async partsUsed(period: 'day' | 'week' | 'month' | 'year', date?: string) {
    const { start, end } = this.getDateRange(period, date);
    const movements = await this.prisma.inventoryMovement.findMany({
      where: {
        type: 'SALIDA',
        createdAt: { gte: start, lte: end },
      },
      include: { item: true, user: true },
      orderBy: { createdAt: 'desc' },
    });

    const grouped: Record<string, { total: number; items: any[] }> = {};
    for (const m of movements) {
      if (!grouped[m.item.name]) grouped[m.item.name] = { total: 0, items: [] };
      grouped[m.item.name].total += m.quantity;
      grouped[m.item.name].items.push(m);
    }

    return { period, start, end, parts: grouped };
  }

  async frequentClients(period: 'day' | 'week' | 'month' | 'year', date?: string) {
    const { start, end } = this.getDateRange(period, date);
    const clients = await this.prisma.client.findMany({
      include: {
        orders: {
          where: { createdAt: { gte: start, lte: end } },
        },
      },
    });

    return clients
      .map((c) => ({
        id: c.id,
        name: c.name,
        document: c.document,
        phone: c.phone,
        totalOrders: c.orders.length,
      }))
      .filter((c) => c.totalOrders > 0)
      .sort((a, b) => b.totalOrders - a.totalOrders);
  }
}
