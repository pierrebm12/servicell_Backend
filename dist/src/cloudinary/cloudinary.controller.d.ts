import { CloudinaryService } from './cloudinary.service';
export declare class CloudinaryController {
    private readonly cloudinaryService;
    constructor(cloudinaryService: CloudinaryService);
    upload(file: Express.Multer.File, folder: string): Promise<{
        url: string;
        publicId: string;
    }>;
    delete(publicId: string): Promise<{
        message: string;
    }>;
}
