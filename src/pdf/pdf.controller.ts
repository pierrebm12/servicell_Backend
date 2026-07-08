import { Controller, Get, Post, Param, ParseIntPipe, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@UseGuards(JwtAuthGuard)
@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('generate/:orderId')
  generate(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Query('type') type: 'INGRESO' | 'ENTREGA' = 'INGRESO',
  ) {
    return this.pdfService.generateOrderPdf(orderId, type);
  }

  @Public()
  @Get('public/:orderNumber')
  async getPublicPdf(
    @Param('orderNumber') orderNumber: string,
    @Query('type') type: 'INGRESO' | 'ENTREGA' = 'INGRESO',
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.pdfService.getPdfByOrderNumber(orderNumber, type);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="orden-${orderNumber}.pdf"`);
    res.send(pdfBuffer);
  }
}
