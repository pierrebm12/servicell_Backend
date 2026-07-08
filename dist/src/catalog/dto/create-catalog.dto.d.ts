export declare class CreateDeviceTypeDto {
    name: string;
    icon?: string;
}
export declare class CreateBrandDto {
    name: string;
}
export declare class CreateDeviceModelDto {
    name: string;
    deviceTypeId: number;
    brandId: number;
}
export declare class CreateServiceTypeDto {
    name: string;
    defaultCost?: number;
}
