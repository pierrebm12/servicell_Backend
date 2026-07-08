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
exports.EquipmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EquipmentService = class EquipmentService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        if (dto.imei) {
            const existing = await this.prisma.equipment.findUnique({ where: { imei: dto.imei } });
            if (existing)
                throw new common_1.ConflictException('IMEI already exists');
        }
        return this.prisma.equipment.create({ data: dto });
    }
    async findAll(search) {
        const where = search ? {
            OR: [
                { imei: { contains: search } },
                { serial: { contains: search } },
                { model: { contains: search } },
                { brand: { contains: search } },
            ],
        } : {};
        return this.prisma.equipment.findMany({ where, orderBy: { createdAt: 'desc' } });
    }
    async findOne(id) {
        const equipment = await this.prisma.equipment.findUnique({ where: { id } });
        if (!equipment)
            throw new common_1.NotFoundException('Equipment not found');
        return equipment;
    }
    async update(id, dto) {
        await this.findOne(id);
        if (dto.imei) {
            const existing = await this.prisma.equipment.findUnique({ where: { imei: dto.imei } });
            if (existing && existing.id !== id)
                throw new common_1.ConflictException('IMEI already exists');
        }
        return this.prisma.equipment.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.equipment.delete({ where: { id } });
        return { message: 'Equipment deleted' };
    }
    async search(q) {
        return this.prisma.equipment.findMany({
            where: {
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
};
exports.EquipmentService = EquipmentService;
exports.EquipmentService = EquipmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EquipmentService);
//# sourceMappingURL=equipment.service.js.map