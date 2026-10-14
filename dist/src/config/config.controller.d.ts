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
    }>;
}
