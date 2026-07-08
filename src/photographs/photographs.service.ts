import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePhotographDto } from './dto/create-photograph.dto';

@Injectable()
export class PhotographsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePhotographDto) {
    const order = await this.prisma.serviceOrder.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Order not found');
    return this.prisma.photograph.create({
      data: {
        url: dto.url,
        type: dto.type || 'DANO',
        orderId: dto.orderId,
      },
    });
  }

  async findByOrder(orderId: number) {
    return this.prisma.photograph.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: number) {
    const photo = await this.prisma.photograph.findUnique({ where: { id } });
    if (!photo) throw new NotFoundException('Photograph not found');
    await this.prisma.photograph.delete({ where: { id } });
    return photo;
  }
}
