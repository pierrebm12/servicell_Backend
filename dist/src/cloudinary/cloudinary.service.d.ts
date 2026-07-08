import { UploadApiResponse } from 'cloudinary';
export declare class CloudinaryService {
    private readonly logger;
    constructor();
    uploadFile(buffer: Buffer, folder: string, publicId?: string): Promise<UploadApiResponse>;
    uploadImage(buffer: Buffer, folder: string, publicId?: string): Promise<UploadApiResponse>;
    uploadPdf(buffer: Buffer, folder: string, publicId?: string): Promise<UploadApiResponse>;
    deleteFile(publicId: string): Promise<void>;
    getUrl(publicId: string, options?: {
        width?: number;
        height?: number;
    }): string;
}
