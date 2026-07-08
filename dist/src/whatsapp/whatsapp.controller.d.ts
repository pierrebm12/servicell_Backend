import { WhatsappService } from './whatsapp.service';
export declare class WhatsappController {
    private readonly whatsappService;
    private readonly logger;
    constructor(whatsappService: WhatsappService);
    sendOrderConfirmation(body: {
        phone: string;
        orderNumber: string;
    }): Promise<{
        message: string;
        id: any;
    } | {
        message: string;
    }>;
    sendApprovalRequest(body: {
        phone: string;
        orderNumber: string;
        cost: number;
    }): Promise<{
        message: string;
        id: any;
    } | {
        message: string;
        id?: undefined;
    }>;
    sendReadyForPickup(body: {
        phone: string;
        orderNumber: string;
    }): Promise<{
        message: string;
        id: any;
    } | {
        message: string;
    }>;
    sendStatusUpdate(body: {
        phone: string;
        orderNumber: string;
        status: string;
    }): Promise<{
        message: string;
        id: any;
    } | {
        message: string;
        id?: undefined;
    }>;
    sendPdf(body: {
        phone: string;
        orderNumber: string;
        type: 'ingreso' | 'entrega';
    }): Promise<{
        message: string;
        id: any;
    } | {
        message: string;
    }>;
}
