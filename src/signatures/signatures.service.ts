import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSignatureDto } from './dto/create-signature.dto';

@Injectable()
export class SignaturesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSignatureDto) {
    const order = await this.prisma.serviceOrder.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Order not found');
    return this.prisma.signature.create({
      data: {
        url: dto.url,
        type: dto.type || 'INGRESO',
        orderId: dto.orderId,
      },
    });
  }

  async findByOrder(orderId: number) {
    return this.prisma.signature.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: number) {
    const sig = await this.prisma.signature.findUnique({ where: { id } });
    if (!sig) throw new NotFoundException('Signature not found');
    await this.prisma.signature.delete({ where: { id } });
    return sig;
  }
}
