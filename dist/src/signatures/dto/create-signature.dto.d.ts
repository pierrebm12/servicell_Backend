import { SignatureType } from '@prisma/client';
export declare class CreateSignatureDto {
    orderId: number;
    url: string;
    type?: SignatureType;
}
