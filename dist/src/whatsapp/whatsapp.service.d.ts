import { PrismaService } from '../prisma/prisma.service';
export declare class WhatsappService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private getConfig;
    sendOrderConfirmation(phone: string, orderNumber: string): Promise<{
        message: string;
        id: any;
    } | {
        message: string;
    }>;
    sendApprovalRequest(phone: string, orderNumber: string, cost: number): Promise<{
        message: string;
        id?: undefined;
    } | {
        message: string;
        id: any;
    }>;
    sendReadyForPickup(phone: string, orderNumber: string): Promise<{
        message: string;
        id: any;
    } | {
        message: string;
    }>;
    sendStatusUpdate(phone: string, orderNumber: string, status: string): Promise<{
        message: string;
        id?: undefined;
    } | {
        message: string;
        id: any;
    }>;
    sendOrderPdf(phone: string, orderNumber: string, type: 'ingreso' | 'entrega', caption: string): Promise<{
        message: string;
        id: any;
    } | {
        message: string;
    }>;
    sendMessage(to: string, message: string): Promise<{
        message: string;
        id?: undefined;
    } | {
        message: string;
        id: any;
    }>;
    private buildMultipart;
}
