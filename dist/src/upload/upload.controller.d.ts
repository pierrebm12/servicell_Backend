import { UploadService } from './upload.service';
declare class Base64UploadDto {
    image: string;
    prefix?: string;
}
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadBase64(dto: Base64UploadDto): Promise<{
        url: string;
        success: boolean;
    }>;
    uploadFile(file: Express.Multer.File): Promise<{
        url: string;
        success: boolean;
    }>;
}
export {};
