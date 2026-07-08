import { OrderStatusEnum } from '@prisma/client';
export declare class UpdateStatusDto {
    status: OrderStatusEnum;
    reason?: string;
}
