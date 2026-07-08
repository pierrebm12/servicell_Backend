import { Controller, Get, Param, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { QrService } from './qr.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Public()
  @Get(':orderNumber')
  async getQr(@Param('orderNumber') orderNumber: string, @Res() res: Response) {
    const buffer = await this.qrService.getQrImage(orderNumber);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(HttpStatus.OK).send(buffer);
  }

  @Public()
  @Get('order-info/:orderNumber')
  async getOrderInfo(@Param('orderNumber') orderNumber: string) {
    return this.qrService.getOrderInfo(orderNumber);
  }

  @UseGuards(JwtAuthGuard)
  @Get('generate/:orderId')
  async generateQr(@Param('orderId') orderId: string) {
    return this.qrService.generateQr(+orderId);
  }
}
