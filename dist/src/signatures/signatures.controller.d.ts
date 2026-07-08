import { SignaturesService } from './signatures.service';
import { CreateSignatureDto } from './dto/create-signature.dto';
export declare class SignaturesController {
    private readonly signaturesService;
    constructor(signaturesService: SignaturesService);
    create(dto: CreateSignatureDto): Promise<{
        id: number;
        createdAt: Date;
        orderId: number;
        type: import("@prisma/client").$Enums.SignatureType;
        url: string;
    }>;
    findByOrder(orderId: number): Promise<{
        id: number;
        createdAt: Date;
        orderId: number;
        type: import("@prisma/client").$Enums.SignatureType;
        url: string;
    }[]>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        orderId: number;
        type: import("@prisma/client").$Enums.SignatureType;
        url: string;
    }>;
}
