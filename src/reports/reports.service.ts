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
          notIn: [OrderStatusEnum.ENTREGADO],
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
    const [users, orders] = await Promise.all([
      this.prisma.user.findMany({ where: { role: 'TECNICO', isActive: true } }),
      this.prisma.serviceOrder.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { id: true, status: true, finalCost: true, assignedToId: true, createdById: true },
      }),
    ]);

    return users
      .map((u) => {
        const mine = orders.filter((o) => o.assignedToId === u.id || o.createdById === u.id);
        const completed = mine.filter((o) => o.status === OrderStatusEnum.ENTREGADO);
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          totalAssigned: mine.length,
          completed: completed.length,
          inProgress: mine.length - completed.length,
          revenue: completed.reduce((sum, o) => sum + Number(o.finalCost || 0), 0),
        };
      })
      .sort((a, b) => b.completed - a.completed || b.totalAssigned - a.totalAssigned || a.name.localeCompare(b.name));
  }

  async partsUsed(period: 'day' | 'week' | 'month' | 'year', date?: string) {
    const { start, end } = this.getDateRange(period, date);
    const [orderParts, movements] = await Promise.all([
      this.prisma.orderPart.findMany({
        where: { order: { createdAt: { gte: start, lte: end } } },
        include: { order: { select: { createdAt: true } } },
      }),
      this.prisma.inventoryMovement.findMany({
        where: { type: 'SALIDA', createdAt: { gte: start, lte: end } },
        include: { item: true },
      }),
    ]);

    const grouped: Record<
      string,
      { name: string; total: number; totalCost: number; fromOrders: number; lastUsedAt: Date | null }
    > = {};

    const add = (name: string | null | undefined, qty: number, cost: number, at: Date | null, fromOrder: boolean) => {
      const key = (name || '').trim();
      if (!key) return;
      if (!grouped[key]) grouped[key] = { name: key, total: 0, totalCost: 0, fromOrders: 0, lastUsedAt: null };
      grouped[key].total += qty;
      grouped[key].totalCost += cost;
      if (fromOrder) grouped[key].fromOrders += qty;
      if (at && (!grouped[key].lastUsedAt || at > grouped[key].lastUsedAt)) grouped[key].lastUsedAt = at;
    };

    for (const p of orderParts) add(p.partName, 1, Number(p.cost || 0), p.order?.createdAt ?? null, true);
    for (const m of movements) add(m.item?.name, m.quantity, Number(m.item?.salePrice || 0) * m.quantity, m.createdAt, false);

    const parts = Object.values(grouped).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
    return { period, start, end, total: parts.length, parts };
  }

  async frequentClients(period: 'day' | 'week' | 'month' | 'year', date?: string) {
    const { start, end } = this.getDateRange(period, date);
    const clients = await this.prisma.client.findMany({
      include: {
        orders: {
          where: { createdAt: { gte: start, lte: end } },
          select: { id: true, finalCost: true, createdAt: true },
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
        totalSpent: c.orders.reduce((sum, o) => sum + Number(o.finalCost || 0), 0),
        lastOrderAt: c.orders.length
          ? c.orders.reduce((max, o) => (o.createdAt > max ? o.createdAt : max), c.orders[0].createdAt)
          : null,
      }))
      .filter((c) => c.totalOrders > 0)
      .sort((a, b) => b.totalOrders - a.totalOrders || b.totalSpent - a.totalSpent);
  }
}
