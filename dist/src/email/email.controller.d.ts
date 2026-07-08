import { EmailService } from './email.service';
export declare class EmailController {
    private readonly emailService;
    constructor(emailService: EmailService);
    sendOrderCreated(body: {
        orderNumber: string;
        clientEmail: string;
        clientName: string;
    }): Promise<{
        message: string;
        messageId?: undefined;
    } | {
        message: string;
        messageId: any;
    }>;
    sendStatusChanged(body: {
        orderNumber: string;
        clientEmail: string;
        clientName: string;
        status: string;
    }): Promise<{
        message: string;
        messageId?: undefined;
    } | {
        message: string;
        messageId: any;
    }>;
    sendReadyForPickup(body: {
        orderNumber: string;
        clientEmail: string;
        clientName: string;
    }): Promise<{
        message: string;
        messageId?: undefined;
    } | {
        message: string;
        messageId: any;
    }>;
    sendPdf(body: {
        email: string;
        orderNumber: string;
        type: 'ingreso' | 'entrega';
    }): Promise<{
        message: string;
        messageId?: undefined;
    } | {
        message: string;
        messageId: any;
    }>;
}
