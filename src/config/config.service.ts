import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateConfigDto } from './dto/update-config.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ConfigService {
  constructor(private prisma: PrismaService) {}

  async get() {
    const config = await this.prisma.companyConfig.findFirst();
    if (!config) {
      return this.prisma.companyConfig.create({ data: {} });
    }
    if (config.logoUrl && config.logoUrl.startsWith('/')) {
      config.logoUrl = this.readLocalFileAsDataUrl(config.logoUrl);
    }
    if (config.pdfLogoUrl && config.pdfLogoUrl.startsWith('/')) {
      config.pdfLogoUrl = this.readLocalFileAsDataUrl(config.pdfLogoUrl);
    }
    return config;
  }

  private readLocalFileAsDataUrl(filePath: string): string {
    const absolutePath = path.join(process.cwd(), filePath.replace(/^\//, ''));
    if (fs.existsSync(absolutePath)) {
      const ext = path.extname(absolutePath).toLowerCase();
      const mime =
        ext === '.png' ? 'image/png' : ext === '.gif' ? 'image/gif' : 'image/jpeg';
      const data = fs.readFileSync(absolutePath);
      return `data:${mime};base64,${data.toString('base64')}`;
    }
    return filePath;
  }

  async update(dto: UpdateConfigDto) {
    const config = await this.prisma.companyConfig.findFirst();
    if (!config) {
      return this.prisma.companyConfig.create({ data: dto });
    }
    return this.prisma.companyConfig.update({
      where: { id: config.id },
      data: dto,
    });
  }
}
