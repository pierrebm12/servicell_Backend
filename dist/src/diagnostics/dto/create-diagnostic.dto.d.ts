export declare class CreateDiagnosticDto {
    orderId: number;
    diagnosis: string;
    neededParts?: string;
    estimatedTime?: string;
    estimatedCost?: number;
    approved?: boolean;
}
