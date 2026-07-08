import { PhotoType } from '@prisma/client';
export declare class CreatePhotographDto {
    orderId: number;
    url: string;
    type?: PhotoType;
}
