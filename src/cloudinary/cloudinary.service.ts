import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(
    buffer: Buffer,
    folder: string,
    publicId?: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `servicell/${folder}`,
          public_id: publicId,
          resource_type: 'auto',
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) {
            this.logger.error(`Cloudinary upload error: ${error.message}`);
            reject(new BadRequestException('File upload failed'));
          } else {
            resolve(result);
          }
        },
      );

      const stream = Readable.from(buffer);
      stream.pipe(uploadStream);
    });
  }

  async uploadImage(buffer: Buffer, folder: string, publicId?: string) {
    return this.uploadFile(buffer, folder, publicId);
  }

  async uploadPdf(buffer: Buffer, folder: string, publicId?: string) {
    return this.uploadFile(buffer, folder, publicId);
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      this.logger.error(`Cloudinary delete error: ${error.message}`);
      throw new BadRequestException('File delete failed');
    }
  }

  getUrl(publicId: string, options?: { width?: number; height?: number }): string {
    return cloudinary.url(publicId, {
      secure: true,
      width: options?.width,
      height: options?.height,
      crop: 'fill',
    });
  }
}
