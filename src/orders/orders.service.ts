import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { OrderStatusEnum } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.serviceOrder.count({
      where: { createdAt: { gte: new Date(year, 0, 1) } },
    });
    return `ORD-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  async create(dto: CreateOrderDto, userId: number) {
    const client = await this.prisma.client.findUnique({ where: { id: dto.clientId } });
    if (!client) throw new NotFoundException('Client not found');
    const equipment = await this.prisma.equipment.findUnique({ where: { id: dto.equipmentId } });
    if (!equipment) throw new NotFoundException('Equipment not found');

    const orderNumber = await this.generateOrderNumber();

    const data: any = {
      orderNumber,
      reportedFault: dto.reportedFault,
      observations: dto.observations,
      physicalState: dto.physicalState,
      devicePassword: dto.devicePassword,
      devicePattern: dto.devicePattern,
      lockCode: dto.lockCode,
      lockCodeType: dto.lockCodeType,
      laborCost: dto.laborCost,
      estimatedCost: dto.estimatedCost,
      downPayment: dto.downPayment,
      estimatedDate: dto.estimatedDate ? new Date(dto.estimatedDate) : undefined,
      clientPhotoUrl: dto.clientPhotoUrl,
      clientId: dto.clientId,
      equipmentId: dto.equipmentId,
      createdById: userId,
      assignedToId: dto.assignedToId,
      deviceTypeId: dto.deviceTypeId,
      brandId: dto.brandId,
      modelId: dto.modelId,
      serviceTypeId: dto.serviceTypeId,
      statusChanges: {
        create: { toStatus: OrderStatusEnum.RECIBIDO, userId },
      },
    };

    if (dto.checklist && dto.checklist.length > 0) {
      data.checklists = {
        create: dto.checklist.map(c => ({
          componentName: c.componentName,
          checked: c.checked,
          notTestable: c.notTestable || false,
        })),
      };
    }

    if (dto.parts && dto.parts.length > 0) {
      data.parts = {
        create: dto.parts.map(p => ({
          partName: p.partName,
          cost: p.cost,
        })),
      };
    }

    const order = await this.prisma.serviceOrder.create({
      data,
      include: {
        client: true, equipment: true, createdBy: true, assignedTo: true,
        deviceType: true, brand: true, model: true, serviceType: true,
        checklists: true, parts: true,
      },
    });

    if (dto.repairNotes) {
      await this.prisma.repairNote.create({
        data: { content: dto.repairNotes, step: 'ingreso', orderId: order.id, userId },
      });
    }

    return order;
  }

  async findAll(filters?: { search?: string; status?: string; limit?: number; sort?: string; dateFrom?: string; dateTo?: string }) {
    const where: any = {};
    const statusMap: Record<string, string[]> = {
      received: ['RECIBIDO'],
      in_repair: ['DIAGNOSTICO', 'EN_REPARACION'],
      pending_approval: ['ESPERANDO_APROBACION', 'ESPERANDO_REPUESTO'],
      approved: ['REPARADO'],
      ready: ['LISTO_ENTREGA'],
      delivered: ['ENTREGADO'],
      cancelled: ['CANCELADO'],
    };
    if (filters?.status && filters.status !== 'all') {
      const backendStatuses = statusMap[filters.status];
      if (backendStatuses) {
        where.status = { in: backendStatuses };
      }
    }
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) {
        const end = new Date(filters.dateTo);
        end.setHours(23, 59, 59);
        where.createdAt.lte = end;
      }
    }

    if (filters?.search) {
      const s = filters.search;
      where.OR = [
        { orderNumber: { contains: s } },
        { client: { name: { contains: s } } },
        { client: { document: { contains: s } } },
        { client: { phone: { contains: s } } },
        { equipment: { imei: { contains: s } } },
        { equipment: { brand: { contains: s } } },
        { equipment: { model: { contains: s } } },
      ];
    }
    const orderBy: any = {};
    if (filters?.sort) {
      const field = filters.sort.startsWith('-') ? filters.sort.slice(1) : filters.sort;
      const dir = filters.sort.startsWith('-') ? 'desc' : 'asc';
      orderBy[field] = dir;
    } else {
      orderBy.createdAt = 'desc';
    }
    return this.prisma.serviceOrder.findMany({
      where,
      include: { client: true, equipment: true, createdBy: true, assignedTo: true },
      orderBy,
      take: filters?.limit || 50,
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        client: true,
        equipment: true,
        createdBy: true,
        assignedTo: true,
        deviceType: true,
        brand: true,
        model: true,
        serviceType: true,
        diagnostics: { include: { user: true }, orderBy: { createdAt: 'desc' } },
        photographs: true,
        signatures: true,
        statusChanges: { include: { user: true }, orderBy: { createdAt: 'desc' } },
        pdfs: true,
        checklists: true,
        parts: true,
        repairNotes: { include: { user: true }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByOrderNumber(orderNumber: string) {
    const order = await this.prisma.serviceOrder.findUnique({
      where: { orderNumber },
      include: { client: true, equipment: true, statusChanges: { orderBy: { createdAt: 'desc' } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(id: number, dto: UpdateOrderDto) {
    await this.prisma.serviceOrder.findUniqueOrThrow({ where: { id } });
    return this.prisma.serviceOrder.update({
      where: { id },
      data: {
        ...dto,
        estimatedDate: dto.estimatedDate ? new Date(dto.estimatedDate) : undefined,
      },
      include: { client: true, equipment: true, assignedTo: true },
    });
  }

  async updateStatus(id: number, dto: UpdateStatusDto, userId: number) {
    const order = await this.prisma.serviceOrder.findUniqueOrThrow({
      where: { id },
      select: { status: true },
    });

    if (dto.status === OrderStatusEnum.ENTREGADO) {
      const photos = await this.prisma.photograph.count({
        where: { orderId: id, type: 'ENTREGA' },
      });
      const signatures = await this.prisma.signature.count({
        where: { orderId: id, type: 'ENTREGA' },
      });
      if (photos === 0) {
        throw new BadRequestException('Debe tomar al menos una foto de entrega');
      }
      if (signatures === 0) {
        throw new BadRequestException('La firma del cliente es obligatoria');
      }
      return this.prisma.serviceOrder.update({
        where: { id },
        data: {
          status: dto.status,
          deliveredAt: new Date(),
          statusChanges: {
            create: { fromStatus: order.status, toStatus: dto.status, reason: dto.reason, userId },
          },
        },
        include: { client: true, equipment: true },
      });
    }

    return this.prisma.serviceOrder.update({
      where: { id },
      data: {
        status: dto.status,
        statusChanges: {
          create: { fromStatus: order.status, toStatus: dto.status, reason: dto.reason, userId },
        },
      },
      include: { client: true, equipment: true },
    });
  }

  async findByStatus(status: OrderStatusEnum) {
    return this.prisma.serviceOrder.findMany({
      where: { status },
      include: { client: true, equipment: true, assignedTo: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByClient(clientId: number) {
    return this.prisma.serviceOrder.findMany({
      where: { clientId },
      include: { client: true, equipment: true, assignedTo: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByTechnician(technicianId: number) {
    return this.prisma.serviceOrder.findMany({
      where: { assignedToId: technicianId },
      include: { client: true, equipment: true, assignedTo: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayOrders, statusCounts, incomeToday, deliveredToday] = await Promise.all([
      this.prisma.serviceOrder.count({
        where: { createdAt: { gte: today, lt: tomorrow } },
      }),
      this.prisma.serviceOrder.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.serviceOrder.aggregate({
        _sum: { finalCost: true },
        where: { deliveredAt: { gte: today, lt: tomorrow } },
      }),
      this.prisma.serviceOrder.count({
        where: { status: OrderStatusEnum.ENTREGADO, deliveredAt: { gte: today, lt: tomorrow } },
      }),
    ]);

    const statusMap: Record<string, number> = {};
    statusCounts.forEach((s) => { statusMap[s.status] = s._count; });
    statusMap[OrderStatusEnum.ENTREGADO] = deliveredToday;

    return {
      todayOrders,
      incomeToday: incomeToday._sum.finalCost || 0,
      byStatus: statusMap,
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.serviceOrder.delete({ where: { id } });
    return { message: 'Order deleted' };
  }

  async addRepairNote(id: number, dto: { content: string; step?: string }, userId: number) {
    await this.findOne(id);
    return this.prisma.repairNote.create({
      data: {
        content: dto.content,
        step: dto.step || 'reparacion',
        orderId: id,
        userId,
      },
      include: { user: true },
    });
  }

  async getRepairNotes(id: number) {
    return this.prisma.repairNote.findMany({
      where: { orderId: id },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
