import { PrismaService } from '../prisma/prisma.service';
import { CreatePhotographDto } from './dto/create-photograph.dto';
export declare class PhotographsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreatePhotographDto): Promise<{
        id: number;
        createdAt: Date;
        orderId: number;
        type: import("@prisma/client").$Enums.PhotoType;
        url: string;
    }>;
    findByOrder(orderId: number): Promise<{
        id: number;
        createdAt: Date;
        orderId: number;
        type: import("@prisma/client").$Enums.PhotoType;
        url: string;
    }[]>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        orderId: number;
        type: import("@prisma/client").$Enums.PhotoType;
        url: string;
    }>;
}
