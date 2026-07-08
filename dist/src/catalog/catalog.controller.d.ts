import { CatalogService } from './catalog.service';
import { CreateDeviceTypeDto, CreateBrandDto, CreateDeviceModelDto, CreateServiceTypeDto } from './dto/create-catalog.dto';
export declare class CatalogController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
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
    getModels(deviceTypeId?: string, brandId?: string): Promise<({
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
