import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiagnosticDto } from './dto/create-diagnostic.dto';

@Injectable()
export class DiagnosticsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDiagnosticDto, userId: number) {
    const order = await this.prisma.serviceOrder.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const diagnostic = await this.prisma.diagnostic.create({
      data: {
        diagnosis: dto.diagnosis,
        neededParts: dto.neededParts,
        estimatedTime: dto.estimatedTime,
        estimatedCost: dto.estimatedCost,
        approved: dto.approved || false,
        approvedAt: dto.approved ? new Date() : undefined,
        orderId: dto.orderId,
        userId,
      },
      include: { user: true },
    });

    if (!order.status || order.status === 'RECIBIDO') {
      await this.prisma.serviceOrder.update({
        where: { id: dto.orderId },
        data: { status: 'DIAGNOSTICO' },
      });
    }

    return diagnostic;
  }

  async findByOrder(orderId: number) {
    return this.prisma.diagnostic.findMany({
      where: { orderId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(id: number) {
    const diagnostic = await this.prisma.diagnostic.findUnique({ where: { id } });
    if (!diagnostic) throw new NotFoundException('Diagnostic not found');

    return this.prisma.diagnostic.update({
      where: { id },
      data: { approved: true, approvedAt: new Date() },
    });
  }
}
