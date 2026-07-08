import { ConfigService } from './config.service';
import { UpdateConfigDto } from './dto/update-config.dto';
export declare class ConfigController {
    private readonly configService;
    constructor(configService: ConfigService);
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
        smtpHost: string | null;
        smtpPort: number | null;
        smtpUser: string | null;
        smtpPass: string | null;
        whatsappToken: string | null;
        whatsappPhoneId: string | null;
    }>;
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
        smtpHost: string | null;
        smtpPort: number | null;
        smtpUser: string | null;
        smtpPass: string | null;
        whatsappToken: string | null;
        whatsappPhoneId: string | null;
    }>;
}
