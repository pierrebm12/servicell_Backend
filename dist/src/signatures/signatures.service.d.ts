import { PrismaService } from '../prisma/prisma.service';
import { CreateSignatureDto } from './dto/create-signature.dto';
export declare class SignaturesService {
    private prisma;
    constructor(prisma: PrismaService);
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
