import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateMovementDto } from './dto/create-movement.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    create(dto: CreateInventoryItemDto): Promise<{
        brand: string | null;
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        reference: string | null;
        quality: string;
        quantity: number;
        minStock: number;
        costPrice: number | null;
        salePrice: number | null;
        supplier: string | null;
    }>;
    findAll(category?: string, search?: string, availableOnly?: string): Promise<{
        brand: string | null;
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        reference: string | null;
        quality: string;
        quantity: number;
        minStock: number;
        costPrice: number | null;
        salePrice: number | null;
        supplier: string | null;
    }[]>;
    getLowStock(): Promise<{
        brand: string | null;
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        reference: string | null;
        quality: string;
        quantity: number;
        minStock: number;
        costPrice: number | null;
        salePrice: number | null;
        supplier: string | null;
    }[]>;
    getAlerts(): Promise<{
        id: number;
        name: string;
        category: string;
        currentStock: number;
        minStock: number;
        status: string;
    }[]>;
    findOne(id: number): Promise<{
        movements: ({
            user: {
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
            userId: number;
            type: import("@prisma/client").$Enums.MovementType;
            reason: string | null;
            quantity: number;
            itemId: number;
        })[];
    } & {
        brand: string | null;
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        reference: string | null;
        quality: string;
        quantity: number;
        minStock: number;
        costPrice: number | null;
        salePrice: number | null;
        supplier: string | null;
    }>;
    update(id: number, dto: UpdateInventoryItemDto): Promise<{
        brand: string | null;
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        reference: string | null;
        quality: string;
        quantity: number;
        minStock: number;
        costPrice: number | null;
        salePrice: number | null;
        supplier: string | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
    createMovement(dto: CreateMovementDto, userId: number): Promise<{
        user: {
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
        item: {
            brand: string | null;
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            category: string;
            reference: string | null;
            quality: string;
            quantity: number;
            minStock: number;
            costPrice: number | null;
            salePrice: number | null;
            supplier: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        userId: number;
        type: import("@prisma/client").$Enums.MovementType;
        reason: string | null;
        quantity: number;
        itemId: number;
    }>;
    getMovements(itemId: number): Promise<({
        user: {
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
        item: {
            brand: string | null;
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            category: string;
            reference: string | null;
            quality: string;
            quantity: number;
            minStock: number;
            costPrice: number | null;
            salePrice: number | null;
            supplier: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        userId: number;
        type: import("@prisma/client").$Enums.MovementType;
        reason: string | null;
        quantity: number;
        itemId: number;
    })[]>;
}
