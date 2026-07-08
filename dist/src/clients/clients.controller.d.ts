import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientQueryDto } from './dto/client-query.dto';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    create(dto: CreateClientDto): Promise<{
        email: string | null;
        id: number;
        name: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        document: string;
        address: string | null;
    }>;
    findAll(search?: string): Promise<{
        email: string | null;
        id: number;
        name: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        document: string;
        address: string | null;
    }[]>;
    search(query: ClientQueryDto): Promise<{
        email: string | null;
        id: number;
        name: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        document: string;
        address: string | null;
    }[]>;
    findOne(id: number): Promise<{
        email: string | null;
        id: number;
        name: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        document: string;
        address: string | null;
    }>;
    getHistory(id: number): Promise<({
        orders: ({
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
    } & {
        email: string | null;
        id: number;
        name: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        document: string;
        address: string | null;
    }) | null>;
    update(id: number, dto: UpdateClientDto): Promise<{
        email: string | null;
        id: number;
        name: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        document: string;
        address: string | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
