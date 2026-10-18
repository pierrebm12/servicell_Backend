import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEquipmentDto) {
    if (dto.imei) {
      const existing = await this.prisma.equipment.findUnique({ where: { imei: dto.imei } });
      if (existing) {
        if (!existing.isActive) {
          return this.prisma.equipment.update({
            where: { id: existing.id },
            data: { ...dto, isActive: true },
          });
        }
        throw new ConflictException('IMEI already exists');
      }
    }
    return this.prisma.equipment.create({ data: dto });
  }

  async findAll(search?: string) {
    const where: any = { isActive: true };
    if (search) {
      where.OR = [
        { imei: { contains: search } },
        { serial: { contains: search } },
        { model: { contains: search } },
        { brand: { contains: search } },
      ];
    }
    return this.prisma.equipment.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    const equipment = await this.prisma.equipment.findUnique({ where: { id } });
    if (!equipment || !equipment.isActive) throw new NotFoundException('Equipment not found');
    return equipment;
  }

  async update(id: number, dto: UpdateEquipmentDto) {
    await this.findOne(id);
    if (dto.imei) {
      const existing = await this.prisma.equipment.findUnique({ where: { imei: dto.imei } });
      if (existing && existing.id !== id) throw new ConflictException('IMEI already exists');
    }
    return this.prisma.equipment.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.equipment.update({ where: { id }, data: { isActive: false } });
    return { message: 'Equipment deactivated' };
  }

  async search(q: string) {
    return this.prisma.equipment.findMany({
      where: {
        isActive: true,
        OR: [
          { imei: { contains: q } },
          { serial: { contains: q } },
          { model: { contains: q } },
          { brand: { contains: q } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
