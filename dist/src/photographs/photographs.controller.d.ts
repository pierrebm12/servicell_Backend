import { PhotographsService } from './photographs.service';
import { CreatePhotographDto } from './dto/create-photograph.dto';
export declare class PhotographsController {
    private readonly photographsService;
    constructor(photographsService: PhotographsService);
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
