import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceTypeDto, CreateBrandDto, CreateDeviceModelDto, CreateServiceTypeDto } from './dto/create-catalog.dto';
export declare class CatalogService implements OnModuleInit {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    seed(): Promise<void>;
    getDeviceTypes(): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        icon: string | null;
    }[]>;
    getBrands(): Promise<{
        id: number;
        name: string;
        createdAt: Date;
    }[]>;
    getModels(deviceTypeId?: number, brandId?: number): Promise<({
        deviceType: {
            id: number;
            name: string;
            createdAt: Date;
            icon: string | null;
        };
        brand: {
            id: number;
            name: string;
            createdAt: Date;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        deviceTypeId: number;
        brandId: number;
    })[]>;
    getServiceTypes(): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        defaultCost: number | null;
    }[]>;
    createDeviceType(dto: CreateDeviceTypeDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        icon: string | null;
    }>;
    createBrand(dto: CreateBrandDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
    }>;
    createModel(dto: CreateDeviceModelDto): Promise<{
        deviceType: {
            id: number;
            name: string;
            createdAt: Date;
            icon: string | null;
        };
        brand: {
            id: number;
            name: string;
            createdAt: Date;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        deviceTypeId: number;
        brandId: number;
    }>;
    createServiceType(dto: CreateServiceTypeDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        defaultCost: number | null;
    }>;
}
