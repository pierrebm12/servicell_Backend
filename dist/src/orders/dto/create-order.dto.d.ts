declare class ChecklistItemDto {
    componentName: string;
    checked: boolean;
    notTestable?: boolean;
}
declare class OrderPartDto {
    partName: string;
    cost: number;
}
export declare class CreateOrderDto {
    clientId: number;
    equipmentId: number;
    reportedFault: string;
    observations?: string;
    physicalState?: string;
    devicePassword?: string;
    devicePattern?: string;
    lockCode?: string;
    lockCodeType?: string;
    laborCost?: number;
    estimatedCost?: number;
    downPayment?: number;
    estimatedDate?: string;
    assignedToId?: number;
    deviceTypeId?: number;
    brandId?: number;
    modelId?: number;
    serviceTypeId?: number;
    clientPhotoUrl?: string;
    checklist?: ChecklistItemDto[];
    parts?: OrderPartDto[];
    repairNotes?: string;
}
export {};
