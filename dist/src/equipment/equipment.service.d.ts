import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
export declare class EquipmentService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateEquipmentDto): Promise<{
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
    }>;
    findAll(search?: string): Promise<{
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
    }[]>;
    findOne(id: number): Promise<{
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
    }>;
    update(id: number, dto: UpdateEquipmentDto): Promise<{
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
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
    search(q: string): Promise<{
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
    }[]>;
}
