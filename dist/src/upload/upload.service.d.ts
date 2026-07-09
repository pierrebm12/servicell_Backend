import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class UploadService {
    private cloudinary;
    private readonly logger;
    private readonly uploadDir;
    constructor(cloudinary: CloudinaryService);
    private fullUrl;
    saveBase64(base64: string, prefix?: string): Promise<string>;
    saveFile(buffer: Buffer, originalName: string): Promise<string>;
}
