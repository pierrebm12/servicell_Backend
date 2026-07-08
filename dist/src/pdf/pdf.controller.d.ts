import { Response } from 'express';
import { PdfService } from './pdf.service';
export declare class PdfController {
    private readonly pdfService;
    constructor(pdfService: PdfService);
    generate(orderId: number, type?: 'INGRESO' | 'ENTREGA'): Promise<string>;
    getPublicPdf(orderNumber: string, type: "INGRESO" | "ENTREGA" | undefined, res: Response): Promise<void>;
}
