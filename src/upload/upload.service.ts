import { Injectable, Logger } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir = path.resolve(process.cwd(), 'uploads');

  constructor(private cloudinary: CloudinaryService) {
    const distDir = path.resolve(process.cwd(), 'dist/uploads');
    for (const dir of [this.uploadDir, distDir]) {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }
  }

  private fullUrl(relative: string): string {
    const baseUrl = process.env.API_URL || '';
    if (baseUrl && relative.startsWith('/')) return `${baseUrl}${relative}`;
    return relative;
  }

  async saveBase64(base64: string, prefix: string = 'photo'): Promise<string> {
    const matches = base64.match(/^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,(.+)$/);
    let ext = 'png';
    let data: string;

    if (matches) {
      ext = matches[1].replace('jpeg', 'jpg').replace('svg+xml', 'svg');
      data = matches[2];
    } else {
      data = base64;
    }

    const buffer = Buffer.from(data, 'base64');
    const filename = `${prefix}_${uuid()}.${ext}`;

    fs.writeFileSync(path.join(this.uploadDir, filename), buffer);

    try {
      const result = await this.cloudinary.uploadFile(buffer, prefix, filename.replace(`.${ext}`, ''));
      this.logger.log(`Uploaded to Cloudinary: ${result.secure_url}`);
      return result.secure_url;
    } catch (err) {
      this.logger.warn(`Cloudinary upload failed, using local: ${(err as Error).message}`);
      return this.fullUrl(`/uploads/${filename}`);
    }
  }

  async saveFile(buffer: Buffer, originalName: string): Promise<string> {
    const ext = path.extname(originalName) || '.png';
    const filename = `photo_${uuid()}${ext}`;

    fs.writeFileSync(path.join(this.uploadDir, filename), buffer);

    try {
      const result = await this.cloudinary.uploadFile(buffer, 'photos', filename.replace(ext, ''));
      this.logger.log(`Uploaded to Cloudinary: ${result.secure_url}`);
      return result.secure_url;
    } catch (err) {
      this.logger.warn(`Cloudinary upload failed, using local: ${(err as Error).message}`);
      return this.fullUrl(`/uploads/${filename}`);
    }
  }
}
