import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateMovementDto } from './dto/create-movement.dto';
import { MovementType } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInventoryItemDto) {
    return this.prisma.inventoryItem.create({ data: dto });
  }

  async findAll(category?: string, search?: string, availableOnly?: string) {
    const where: any = {};
    if (category) where.category = category;
    if (search) {
      where.AND = [
        { quantity: { gt: 0 } },
        {
          OR: [
            { name: { contains: search } },
            { reference: { contains: search } },
            { brand: { contains: search } },
          ],
        },
      ];
    } else if (availableOnly === 'true') {
      where.quantity = { gt: 0 };
    }
    return this.prisma.inventoryItem.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: { movements: { include: { user: true }, orderBy: { createdAt: 'desc' } } },
    });
    if (!item) throw new NotFoundException('Inventory item not found');
    return item;
  }

  async update(id: number, dto: UpdateInventoryItemDto) {
    await this.findOne(id);
    return this.prisma.inventoryItem.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.inventoryItem.delete({ where: { id } });
    return { message: 'Item deleted' };
  }

  async createMovement(dto: CreateMovementDto, userId: number) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id: dto.itemId } });
    if (!item) throw new NotFoundException('Inventory item not found');

    let newQuantity: number;
    if (dto.type === MovementType.ENTRADA) {
      newQuantity = item.quantity + dto.quantity;
    } else if (dto.type === MovementType.SALIDA) {
      if (item.quantity < dto.quantity) {
        throw new BadRequestException(`Insufficient stock. Available: ${item.quantity}, requested: ${dto.quantity}`);
      }
      newQuantity = item.quantity - dto.quantity;
    } else {
      newQuantity = dto.quantity;
    }

    const movement = await this.prisma.inventoryMovement.create({
      data: {
        type: dto.type,
        quantity: dto.quantity,
        reason: dto.reason,
        itemId: dto.itemId,
        userId,
      },
      include: { item: true, user: true },
    });

    await this.prisma.inventoryItem.update({
      where: { id: dto.itemId },
      data: { quantity: newQuantity },
    });

    return movement;
  }

  async getMovements(itemId: number) {
    return this.prisma.inventoryMovement.findMany({
      where: { itemId },
      include: { user: true, item: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLowStock() {
    const items = await this.prisma.inventoryItem.findMany();
    return items.filter((item) => item.quantity <= item.minStock).sort((a, b) => a.quantity - b.quantity);
  }

  async getAlerts() {
    const items = await this.prisma.inventoryItem.findMany();
    return items
      .filter((item) => item.quantity <= item.minStock)
      .map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        currentStock: item.quantity,
        minStock: item.minStock,
        status: item.quantity === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
      }));
  }
}
