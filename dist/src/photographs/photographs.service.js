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
exports.PhotographsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PhotographsService = class PhotographsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const order = await this.prisma.serviceOrder.findUnique({ where: { id: dto.orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return this.prisma.photograph.create({
            data: {
                url: dto.url,
                type: dto.type || 'DANO',
                orderId: dto.orderId,
            },
        });
    }
    async findByOrder(orderId) {
        return this.prisma.photograph.findMany({
            where: { orderId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async remove(id) {
        const photo = await this.prisma.photograph.findUnique({ where: { id } });
        if (!photo)
            throw new common_1.NotFoundException('Photograph not found');
        await this.prisma.photograph.delete({ where: { id } });
        return photo;
    }
};
exports.PhotographsService = PhotographsService;
exports.PhotographsService = PhotographsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PhotographsService);
//# sourceMappingURL=photographs.service.js.map