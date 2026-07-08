import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
export declare class EquipmentController {
    private readonly equipmentService;
    constructor(equipmentService: EquipmentService);
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
}
