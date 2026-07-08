import { Controller, Post, Body, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { IsString } from 'class-validator';

class Base64UploadDto {
  @IsString()
  image: string;

  @IsString()
  prefix?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('base64')
  async uploadBase64(@Body() dto: Base64UploadDto) {
    const url = await this.uploadService.saveBase64(dto.image, dto.prefix);
    return { url, success: true };
  }

  @Post('file')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File required');
    const url = await this.uploadService.saveFile(file.buffer, file.originalname);
    return { url, success: true };
  }
}
