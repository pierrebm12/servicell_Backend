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
exports.SignaturesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SignaturesService = class SignaturesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const order = await this.prisma.serviceOrder.findUnique({ where: { id: dto.orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return this.prisma.signature.create({
            data: {
                url: dto.url,
                type: dto.type || 'INGRESO',
                orderId: dto.orderId,
            },
        });
    }
    async findByOrder(orderId) {
        return this.prisma.signature.findMany({
            where: { orderId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async remove(id) {
        const sig = await this.prisma.signature.findUnique({ where: { id } });
        if (!sig)
            throw new common_1.NotFoundException('Signature not found');
        await this.prisma.signature.delete({ where: { id } });
        return sig;
    }
};
exports.SignaturesService = SignaturesService;
exports.SignaturesService = SignaturesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SignaturesService);
//# sourceMappingURL=signatures.service.js.map