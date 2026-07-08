import { Controller, Post, Delete, UseInterceptors, UploadedFile, Param, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload/:folder')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File, @Param('folder') folder: string) {
    const result = await this.cloudinaryService.uploadFile(file.buffer, folder);
    return { url: result.secure_url, publicId: result.public_id };
  }

  @Delete(':publicId')
  async delete(@Param('publicId') publicId: string) {
    await this.cloudinaryService.deleteFile(publicId);
    return { message: 'File deleted' };
  }
}
