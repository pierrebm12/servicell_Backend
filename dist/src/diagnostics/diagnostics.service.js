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
exports.DiagnosticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DiagnosticsService = class DiagnosticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, userId) {
        const order = await this.prisma.serviceOrder.findUnique({ where: { id: dto.orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
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
    async findByOrder(orderId) {
        return this.prisma.diagnostic.findMany({
            where: { orderId },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async approve(id) {
        const diagnostic = await this.prisma.diagnostic.findUnique({ where: { id } });
        if (!diagnostic)
            throw new common_1.NotFoundException('Diagnostic not found');
        return this.prisma.diagnostic.update({
            where: { id },
            data: { approved: true, approvedAt: new Date() },
        });
    }
};
exports.DiagnosticsService = DiagnosticsService;
exports.DiagnosticsService = DiagnosticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DiagnosticsService);
//# sourceMappingURL=diagnostics.service.js.map