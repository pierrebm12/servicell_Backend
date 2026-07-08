import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getDateRange;
    receivedEquipment(period: 'day' | 'week' | 'month' | 'year', date?: string): Promise<{
        period: "day" | "week" | "month" | "year";
        start: Date;
        end: Date;
        total: number;
        orders: ({
            client: {
                email: string | null;
                id: number;
                name: string;
                phone: string;
                createdAt: Date;
                updatedAt: Date;
                document: string;
                address: string | null;
            };
            equipment: {
                brand: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                model: string;
                imei: string | null;
                serial: string | null;
                color: string | null;
                operator: string | null;
                accessories: string | null;
            };
            createdBy: {
                email: string;
                password: string;
                id: number;
                name: string;
                phone: string | null;
                role: import("@prisma/client").$Enums.Role;
                isActive: boolean;
                photoUrl: string | null;
                refreshToken: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            orderNumber: string;
            reportedFault: string;
            observations: string | null;
            physicalState: string | null;
            devicePassword: string | null;
            devicePattern: string | null;
            lockCode: string | null;
            lockCodeType: string | null;
            laborCost: number | null;
            clientPhotoUrl: string | null;
            status: import("@prisma/client").$Enums.OrderStatusEnum;
            estimatedCost: number | null;
            finalCost: number | null;
            downPayment: number | null;
            estimatedDate: Date | null;
            deliveredAt: Date | null;
            clientId: number;
            equipmentId: number;
            createdById: number;
            assignedToId: number | null;
            deviceTypeId: number | null;
            brandId: number | null;
            modelId: number | null;
            serviceTypeId: number | null;
        })[];
    }>;
    deliveredEquipment(period: 'day' | 'week' | 'month' | 'year', date?: string): Promise<{
        period: "day" | "week" | "month" | "year";
        start: Date;
        end: Date;
        total: number;
        orders: ({
            client: {
                email: string | null;
                id: number;
                name: string;
                phone: string;
                createdAt: Date;
                updatedAt: Date;
                document: string;
                address: string | null;
            };
            equipment: {
                brand: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                model: string;
                imei: string | null;
                serial: string | null;
                color: string | null;
                operator: string | null;
                accessories: string | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            orderNumber: string;
            reportedFault: string;
            observations: string | null;
            physicalState: string | null;
            devicePassword: string | null;
            devicePattern: string | null;
            lockCode: string | null;
            lockCodeType: string | null;
            laborCost: number | null;
            clientPhotoUrl: string | null;
            status: import("@prisma/client").$Enums.OrderStatusEnum;
            estimatedCost: number | null;
            finalCost: number | null;
            downPayment: number | null;
            estimatedDate: Date | null;
            deliveredAt: Date | null;
            clientId: number;
            equipmentId: number;
            createdById: number;
            assignedToId: number | null;
            deviceTypeId: number | null;
            brandId: number | null;
            modelId: number | null;
            serviceTypeId: number | null;
        })[];
    }>;
    pending(): Promise<{
        total: number;
        orders: ({
            client: {
                email: string | null;
                id: number;
                name: string;
                phone: string;
                createdAt: Date;
                updatedAt: Date;
                document: string;
                address: string | null;
            };
            equipment: {
                brand: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                model: string;
                imei: string | null;
                serial: string | null;
                color: string | null;
                operator: string | null;
                accessories: string | null;
            };
            assignedTo: {
                email: string;
                password: string;
                id: number;
                name: string;
                phone: string | null;
                role: import("@prisma/client").$Enums.Role;
                isActive: boolean;
                photoUrl: string | null;
                refreshToken: string | null;
                createdAt: Date;
                updatedAt: Date;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            orderNumber: string;
            reportedFault: string;
            observations: string | null;
            physicalState: string | null;
            devicePassword: string | null;
            devicePattern: string | null;
            lockCode: string | null;
            lockCodeType: string | null;
            laborCost: number | null;
            clientPhotoUrl: string | null;
            status: import("@prisma/client").$Enums.OrderStatusEnum;
            estimatedCost: number | null;
            finalCost: number | null;
            downPayment: number | null;
            estimatedDate: Date | null;
            deliveredAt: Date | null;
            clientId: number;
            equipmentId: number;
            createdById: number;
            assignedToId: number | null;
            deviceTypeId: number | null;
            brandId: number | null;
            modelId: number | null;
            serviceTypeId: number | null;
        })[];
    }>;
    income(period: 'day' | 'week' | 'month' | 'year', date?: string): Promise<{
        period: "day" | "week" | "month" | "year";
        start: Date;
        end: Date;
        totalIncome: number;
        count: number;
        orders: {
            client: {
                name: string;
            };
            orderNumber: string;
            finalCost: number | null;
            deliveredAt: Date | null;
        }[];
    }>;
    techProductivity(period: 'day' | 'week' | 'month' | 'year', date?: string): Promise<{
        id: number;
        name: string;
        email: string;
        totalAssigned: number;
        completed: number;
        inProgress: number;
        orders: ({
            client: {
                email: string | null;
                id: number;
                name: string;
                phone: string;
                createdAt: Date;
                updatedAt: Date;
                document: string;
                address: string | null;
            };
            equipment: {
                brand: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                model: string;
                imei: string | null;
                serial: string | null;
                color: string | null;
                operator: string | null;
                accessories: string | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            orderNumber: string;
            reportedFault: string;
            observations: string | null;
            physicalState: string | null;
            devicePassword: string | null;
            devicePattern: string | null;
            lockCode: string | null;
            lockCodeType: string | null;
            laborCost: number | null;
            clientPhotoUrl: string | null;
            status: import("@prisma/client").$Enums.OrderStatusEnum;
            estimatedCost: number | null;
            finalCost: number | null;
            downPayment: number | null;
            estimatedDate: Date | null;
            deliveredAt: Date | null;
            clientId: number;
            equipmentId: number;
            createdById: number;
            assignedToId: number | null;
            deviceTypeId: number | null;
            brandId: number | null;
            modelId: number | null;
            serviceTypeId: number | null;
        })[];
    }[]>;
    partsUsed(period: 'day' | 'week' | 'month' | 'year', date?: string): Promise<{
        period: "day" | "week" | "month" | "year";
        start: Date;
        end: Date;
        parts: Record<string, {
            total: number;
            items: any[];
        }>;
    }>;
    frequentClients(period: 'day' | 'week' | 'month' | 'year', date?: string): Promise<{
        id: number;
        name: string;
        document: string;
        phone: string;
        totalOrders: number;
    }[]>;
}
