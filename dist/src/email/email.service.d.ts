import { PrismaService } from '../prisma/prisma.service';
export declare class EmailService {
    private prisma;
    private readonly logger;
    private transporter;
    constructor(prisma: PrismaService);
    private initTransporter;
    sendOrderCreated(orderNumber: string, clientEmail: string, clientName: string): Promise<{
        message: string;
        messageId?: undefined;
    } | {
        message: string;
        messageId: any;
    }>;
    sendStatusChanged(orderNumber: string, clientEmail: string, clientName: string, status: string): Promise<{
        message: string;
        messageId?: undefined;
    } | {
        message: string;
        messageId: any;
    }>;
    sendReadyForPickup(orderNumber: string, clientEmail: string, clientName: string): Promise<{
        message: string;
        messageId?: undefined;
    } | {
        message: string;
        messageId: any;
    }>;
    sendEmailWithPdf(to: string, subject: string, html: string, orderNumber: string, pdfType: 'ingreso' | 'entrega'): Promise<{
        message: string;
        messageId?: undefined;
    } | {
        message: string;
        messageId: any;
    }>;
    sendEmail(to: string, subject: string, html: string): Promise<{
        message: string;
        messageId?: undefined;
    } | {
        message: string;
        messageId: any;
    }>;
    private buildHtml;
}
