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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getDateRange(period, date) {
        const start = date ? new Date(date) : new Date();
        const end = new Date(start);
        switch (period) {
            case 'day':
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                break;
            case 'week':
                start.setDate(start.getDate() - start.getDay());
                start.setHours(0, 0, 0, 0);
                end.setDate(start.getDate() + 6);
                end.setHours(23, 59, 59, 999);
                break;
            case 'month':
                start.setDate(1);
                start.setHours(0, 0, 0, 0);
                end.setMonth(end.getMonth() + 1, 0);
                end.setHours(23, 59, 59, 999);
                break;
            case 'year':
                start.setMonth(0, 1);
                start.setHours(0, 0, 0, 0);
                end.setMonth(11, 31);
                end.setHours(23, 59, 59, 999);
                break;
        }
        return { start, end };
    }
    async receivedEquipment(period, date) {
        const { start, end } = this.getDateRange(period, date);
        const orders = await this.prisma.serviceOrder.findMany({
            where: { createdAt: { gte: start, lte: end } },
            include: { client: true, equipment: true, createdBy: true },
            orderBy: { createdAt: 'desc' },
        });
        return { period, start, end, total: orders.length, orders };
    }
    async deliveredEquipment(period, date) {
        const { start, end } = this.getDateRange(period, date);
        const orders = await this.prisma.serviceOrder.findMany({
            where: {
                status: client_1.OrderStatusEnum.ENTREGADO,
                deliveredAt: { gte: start, lte: end },
            },
            include: { client: true, equipment: true },
            orderBy: { deliveredAt: 'desc' },
        });
        return { period, start, end, total: orders.length, orders };
    }
    async pending() {
        const orders = await this.prisma.serviceOrder.findMany({
            where: {
                status: {
                    notIn: [client_1.OrderStatusEnum.ENTREGADO, client_1.OrderStatusEnum.CANCELADO],
                },
            },
            include: { client: true, equipment: true, assignedTo: true },
            orderBy: { createdAt: 'desc' },
        });
        return { total: orders.length, orders };
    }
    async income(period, date) {
        const { start, end } = this.getDateRange(period, date);
        const orders = await this.prisma.serviceOrder.findMany({
            where: {
                status: client_1.OrderStatusEnum.ENTREGADO,
                deliveredAt: { gte: start, lte: end },
            },
            select: {
                orderNumber: true,
                finalCost: true,
                deliveredAt: true,
                client: { select: { name: true } },
            },
            orderBy: { deliveredAt: 'desc' },
        });
        const totalIncome = orders.reduce((sum, o) => sum + (o.finalCost || 0), 0);
        return { period, start, end, totalIncome, count: orders.length, orders };
    }
    async techProductivity(period, date) {
        const { start, end } = this.getDateRange(period, date);
        const users = await this.prisma.user.findMany({
            where: { role: 'TECNICO' },
            include: {
                ordersAssigned: {
                    where: { createdAt: { gte: start, lte: end } },
                    include: { client: true, equipment: true },
                },
            },
        });
        return users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            totalAssigned: u.ordersAssigned.length,
            completed: u.ordersAssigned.filter((o) => o.status === client_1.OrderStatusEnum.ENTREGADO).length,
            inProgress: u.ordersAssigned.filter((o) => o.status !== client_1.OrderStatusEnum.ENTREGADO && o.status !== client_1.OrderStatusEnum.CANCELADO).length,
            orders: u.ordersAssigned,
        }));
    }
    async partsUsed(period, date) {
        const { start, end } = this.getDateRange(period, date);
        const movements = await this.prisma.inventoryMovement.findMany({
            where: {
                type: 'SALIDA',
                createdAt: { gte: start, lte: end },
            },
            include: { item: true, user: true },
            orderBy: { createdAt: 'desc' },
        });
        const grouped = {};
        for (const m of movements) {
            if (!grouped[m.item.name])
                grouped[m.item.name] = { total: 0, items: [] };
            grouped[m.item.name].total += m.quantity;
            grouped[m.item.name].items.push(m);
        }
        return { period, start, end, parts: grouped };
    }
    async frequentClients(period, date) {
        const { start, end } = this.getDateRange(period, date);
        const clients = await this.prisma.client.findMany({
            include: {
                orders: {
                    where: { createdAt: { gte: start, lte: end } },
                },
            },
        });
        return clients
            .map((c) => ({
            id: c.id,
            name: c.name,
            document: c.document,
            phone: c.phone,
            totalOrders: c.orders.length,
        }))
            .filter((c) => c.totalOrders > 0)
            .sort((a, b) => b.totalOrders - a.totalOrders);
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map