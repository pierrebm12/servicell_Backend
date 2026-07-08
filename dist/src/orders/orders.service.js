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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let OrdersService = class OrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateOrderNumber() {
        const year = new Date().getFullYear();
        const count = await this.prisma.serviceOrder.count({
            where: { createdAt: { gte: new Date(year, 0, 1) } },
        });
        return `ORD-${year}-${String(count + 1).padStart(6, '0')}`;
    }
    async create(dto, userId) {
        const client = await this.prisma.client.findUnique({ where: { id: dto.clientId } });
        if (!client)
            throw new common_1.NotFoundException('Client not found');
        const equipment = await this.prisma.equipment.findUnique({ where: { id: dto.equipmentId } });
        if (!equipment)
            throw new common_1.NotFoundException('Equipment not found');
        const orderNumber = await this.generateOrderNumber();
        const data = {
            orderNumber,
            reportedFault: dto.reportedFault,
            observations: dto.observations,
            physicalState: dto.physicalState,
            devicePassword: dto.devicePassword,
            devicePattern: dto.devicePattern,
            lockCode: dto.lockCode,
            lockCodeType: dto.lockCodeType,
            laborCost: dto.laborCost,
            estimatedCost: dto.estimatedCost,
            downPayment: dto.downPayment,
            estimatedDate: dto.estimatedDate ? new Date(dto.estimatedDate) : undefined,
            clientPhotoUrl: dto.clientPhotoUrl,
            clientId: dto.clientId,
            equipmentId: dto.equipmentId,
            createdById: userId,
            assignedToId: dto.assignedToId,
            deviceTypeId: dto.deviceTypeId,
            brandId: dto.brandId,
            modelId: dto.modelId,
            serviceTypeId: dto.serviceTypeId,
            statusChanges: {
                create: { toStatus: client_1.OrderStatusEnum.RECIBIDO, userId },
            },
        };
        if (dto.checklist && dto.checklist.length > 0) {
            data.checklists = {
                create: dto.checklist.map(c => ({
                    componentName: c.componentName,
                    checked: c.checked,
                    notTestable: c.notTestable || false,
                })),
            };
        }
        if (dto.parts && dto.parts.length > 0) {
            data.parts = {
                create: dto.parts.map(p => ({
                    partName: p.partName,
                    cost: p.cost,
                })),
            };
        }
        const order = await this.prisma.serviceOrder.create({
            data,
            include: {
                client: true, equipment: true, createdBy: true, assignedTo: true,
                deviceType: true, brand: true, model: true, serviceType: true,
                checklists: true, parts: true,
            },
        });
        if (dto.repairNotes) {
            await this.prisma.repairNote.create({
                data: { content: dto.repairNotes, step: 'ingreso', orderId: order.id, userId },
            });
        }
        return order;
    }
    async findAll(filters) {
        const where = {};
        const statusMap = {
            received: ['RECIBIDO'],
            in_repair: ['DIAGNOSTICO', 'EN_REPARACION'],
            pending_approval: ['ESPERANDO_APROBACION', 'ESPERANDO_REPUESTO'],
            approved: ['REPARADO'],
            ready: ['LISTO_ENTREGA'],
            delivered: ['ENTREGADO'],
            cancelled: ['CANCELADO'],
        };
        if (filters?.status && filters.status !== 'all') {
            const backendStatuses = statusMap[filters.status];
            if (backendStatuses) {
                where.status = { in: backendStatuses };
            }
        }
        if (filters?.search) {
            const s = filters.search;
            where.OR = [
                { orderNumber: { contains: s } },
                { client: { name: { contains: s } } },
                { client: { document: { contains: s } } },
                { client: { phone: { contains: s } } },
                { equipment: { imei: { contains: s } } },
                { equipment: { brand: { contains: s } } },
                { equipment: { model: { contains: s } } },
            ];
        }
        const orderBy = {};
        if (filters?.sort) {
            const field = filters.sort.startsWith('-') ? filters.sort.slice(1) : filters.sort;
            const dir = filters.sort.startsWith('-') ? 'desc' : 'asc';
            orderBy[field] = dir;
        }
        else {
            orderBy.createdAt = 'desc';
        }
        return this.prisma.serviceOrder.findMany({
            where,
            include: { client: true, equipment: true, createdBy: true, assignedTo: true },
            orderBy,
            take: filters?.limit || 50,
        });
    }
    async findOne(id) {
        const order = await this.prisma.serviceOrder.findUnique({
            where: { id },
            include: {
                client: true,
                equipment: true,
                createdBy: true,
                assignedTo: true,
                deviceType: true,
                brand: true,
                model: true,
                serviceType: true,
                diagnostics: { include: { user: true }, orderBy: { createdAt: 'desc' } },
                photographs: true,
                signatures: true,
                statusChanges: { include: { user: true }, orderBy: { createdAt: 'desc' } },
                pdfs: true,
                checklists: true,
                parts: true,
                repairNotes: { include: { user: true }, orderBy: { createdAt: 'desc' } },
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async findByOrderNumber(orderNumber) {
        const order = await this.prisma.serviceOrder.findUnique({
            where: { orderNumber },
            include: { client: true, equipment: true, statusChanges: { orderBy: { createdAt: 'desc' } } },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async update(id, dto) {
        await this.prisma.serviceOrder.findUniqueOrThrow({ where: { id } });
        return this.prisma.serviceOrder.update({
            where: { id },
            data: {
                ...dto,
                estimatedDate: dto.estimatedDate ? new Date(dto.estimatedDate) : undefined,
            },
            include: { client: true, equipment: true, assignedTo: true },
        });
    }
    async updateStatus(id, dto, userId) {
        const order = await this.prisma.serviceOrder.findUniqueOrThrow({
            where: { id },
            select: { status: true },
        });
        if (dto.status === client_1.OrderStatusEnum.ENTREGADO) {
            const photos = await this.prisma.photograph.count({
                where: { orderId: id, type: 'ENTREGA' },
            });
            const signatures = await this.prisma.signature.count({
                where: { orderId: id, type: 'ENTREGA' },
            });
            if (photos === 0) {
                throw new common_1.BadRequestException('Debe tomar al menos una foto de entrega');
            }
            if (signatures === 0) {
                throw new common_1.BadRequestException('La firma del cliente es obligatoria');
            }
            return this.prisma.serviceOrder.update({
                where: { id },
                data: {
                    status: dto.status,
                    deliveredAt: new Date(),
                    statusChanges: {
                        create: { fromStatus: order.status, toStatus: dto.status, reason: dto.reason, userId },
                    },
                },
                include: { client: true, equipment: true },
            });
        }
        return this.prisma.serviceOrder.update({
            where: { id },
            data: {
                status: dto.status,
                statusChanges: {
                    create: { fromStatus: order.status, toStatus: dto.status, reason: dto.reason, userId },
                },
            },
            include: { client: true, equipment: true },
        });
    }
    async findByStatus(status) {
        return this.prisma.serviceOrder.findMany({
            where: { status },
            include: { client: true, equipment: true, assignedTo: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByClient(clientId) {
        return this.prisma.serviceOrder.findMany({
            where: { clientId },
            include: { client: true, equipment: true, assignedTo: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByTechnician(technicianId) {
        return this.prisma.serviceOrder.findMany({
            where: { assignedToId: technicianId },
            include: { client: true, equipment: true, assignedTo: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [todayOrders, statusCounts, incomeToday, deliveredToday] = await Promise.all([
            this.prisma.serviceOrder.count({
                where: { createdAt: { gte: today, lt: tomorrow } },
            }),
            this.prisma.serviceOrder.groupBy({
                by: ['status'],
                _count: true,
            }),
            this.prisma.serviceOrder.aggregate({
                _sum: { finalCost: true },
                where: { deliveredAt: { gte: today, lt: tomorrow } },
            }),
            this.prisma.serviceOrder.count({
                where: { status: client_1.OrderStatusEnum.ENTREGADO, deliveredAt: { gte: today, lt: tomorrow } },
            }),
        ]);
        const statusMap = {};
        statusCounts.forEach((s) => { statusMap[s.status] = s._count; });
        statusMap[client_1.OrderStatusEnum.ENTREGADO] = deliveredToday;
        return {
            todayOrders,
            incomeToday: incomeToday._sum.finalCost || 0,
            byStatus: statusMap,
        };
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.serviceOrder.delete({ where: { id } });
        return { message: 'Order deleted' };
    }
    async addRepairNote(id, dto, userId) {
        await this.findOne(id);
        return this.prisma.repairNote.create({
            data: {
                content: dto.content,
                step: dto.step || 'reparacion',
                orderId: id,
                userId,
            },
            include: { user: true },
        });
    }
    async getRepairNotes(id) {
        return this.prisma.repairNote.findMany({
            where: { orderId: id },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map