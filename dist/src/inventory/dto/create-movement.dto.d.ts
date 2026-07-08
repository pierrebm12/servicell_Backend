import { MovementType } from '@prisma/client';
export declare class CreateMovementDto {
    itemId: number;
    type: MovementType;
    quantity: number;
    reason?: string;
}
