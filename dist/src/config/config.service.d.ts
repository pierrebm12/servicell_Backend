import { PrismaService } from '../prisma/prisma.service';
import { UpdateConfigDto } from './dto/update-config.dto';
export declare class ConfigService {
    private prisma;
    constructor(prisma: PrismaService);
    get(): Promise<{
        email: string | null;
        id: number;
        phone: string | null;
        updatedAt: Date;
        address: string | null;
        companyName: string;
        logoUrl: string | null;
        pdfLogoUrl: string | null;
        terms: string | null;
        primaryColor: string;
    }>;
    private readLocalFileAsDataUrl;
    update(dto: UpdateConfigDto): Promise<{
        email: string | null;
        id: number;
        phone: string | null;
        updatedAt: Date;
        address: string | null;
        companyName: string;
        logoUrl: string | null;
        pdfLogoUrl: string | null;
        terms: string | null;
        primaryColor: string;
    }>;
}
