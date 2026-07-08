"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let InventoryService = class InventoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.inventoryItem.create({ data: dto });
    }
    async findAll(category, search, availableOnly) {
        const where = {};
        if (category)
            where.category = category;
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
        }
        else if (availableOnly === 'true') {
            where.quantity = { gt: 0 };
        }
        return this.prisma.inventoryItem.findMany({
            where,
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const item = await this.prisma.inventoryItem.findUnique({
            where: { id },
            include: { movements: { include: { user: true }, orderBy: { createdAt: 'desc' } } },
        });
        if (!item)
            throw new common_1.NotFoundException('Inventory item not found');
        return item;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.inventoryItem.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.inventoryItem.delete({ where: { id } });
        return { message: 'Item deleted' };
    }
    async createMovement(dto, userId) {
        const item = await this.prisma.inventoryItem.findUnique({ where: { id: dto.itemId } });
        if (!item)
            throw new common_1.NotFoundException('Inventory item not found');
        let newQuantity;
        if (dto.type === client_1.MovementType.ENTRADA) {
            newQuantity = item.quantity + dto.quantity;
        }
        else if (dto.type === client_1.MovementType.SALIDA) {
            if (item.quantity < dto.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock. Available: ${item.quantity}, requested: ${dto.quantity}`);
            }
            newQuantity = item.quantity - dto.quantity;
        }
        else {
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
    async getMovements(itemId) {
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
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map