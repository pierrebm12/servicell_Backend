import { PrismaService } from '../prisma/prisma.service';
export declare class PdfService {
    private prisma;
    private readonly logger;
    private readonly uploadDir;
    private accentR;
    private accentG;
    private accentB;
    constructor(prisma: PrismaService);
    private get accent();
    private get accentLight();
    private get accentBg();
    generateOrderPdf(orderId: number, type: 'INGRESO' | 'ENTREGA'): Promise<string>;
    getPdfByOrderNumber(orderNumber: string, type?: 'INGRESO' | 'ENTREGA'): Promise<Buffer>;
    private newPage;
    private ensureSpace;
    private ensureSpaceAndSync;
    private drawSectionBox;
    private tryDrawLogo;
    private tryDrawImage;
    private fetchImageBuffer;
    private drawJustifiedText;
    private drawLines;
    private drawPatternLock;
    private sanitizeText;
    private drawSafe;
    private wrapText;
}
