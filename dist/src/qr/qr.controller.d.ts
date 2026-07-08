import { Response } from 'express';
import { QrService } from './qr.service';
export declare class QrController {
    private readonly qrService;
    constructor(qrService: QrService);
    getQr(orderNumber: string, res: Response): Promise<void>;
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
    generateQr(orderId: string): Promise<string>;
}
