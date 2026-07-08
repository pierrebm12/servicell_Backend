import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { SearchType } from './dto/client-query.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateClientDto) {
    const existing = await this.prisma.client.findUnique({ where: { document: dto.document } });
    if (existing) throw new ConflictException('Document already exists');
    return this.prisma.client.create({ data: dto });
  }

  async findAll(search?: string) {
    const where = search ? {
      OR: [
        { name: { contains: search } },
        { document: { contains: search } },
        { phone: { contains: search } },
      ],
    } : {};
    return this.prisma.client.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async update(id: number, dto: UpdateClientDto) {
    await this.findOne(id);
    return this.prisma.client.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.client.delete({ where: { id } });
    return { message: 'Client deleted' };
  }

  async search(q: string, type?: SearchType) {
    const where: any = {};
    if (type === SearchType.NAME || !type) where.name = { contains: q };
    else if (type === SearchType.DOCUMENT) where.document = { contains: q };
    else if (type === SearchType.PHONE) where.phone = { contains: q };
    return this.prisma.client.findMany({
      where: type ? where : {
        OR: [
          { name: { contains: q } },
          { document: { contains: q } },
          { phone: { contains: q } },
        ],
      },
      orderBy: { name: 'asc' },
    });
  }

  async getHistory(id: number) {
    await this.findOne(id);
    return this.prisma.client.findUnique({
      where: { id },
      include: {
        orders: {
          include: { equipment: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }
}
