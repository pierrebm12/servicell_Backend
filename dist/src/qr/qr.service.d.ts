import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class QrService {
    private prisma;
    private cloudinary;
    private readonly logger;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    generateQr(orderId: number): Promise<string>;
    getQrImage(orderNumber: string): Promise<Buffer>;
    getOrderInfo(orderNumber: string): Promise<{
        orderNumber: string;
        status: import("@prisma/client").$Enums.OrderStatusEnum;
        reportedFault: string;
        estimatedDate: Date | null;
        client: {
            name: string;
            phone: string;
            document: string;
        };
        equipment: {
            brand: string;
            model: string;
            imei: string | null;
        };
    }>;
}
