import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('order-created')
  sendOrderCreated(@Body() body: { orderNumber: string; clientEmail: string; clientName: string }) {
    return this.emailService.sendOrderCreated(body.orderNumber, body.clientEmail, body.clientName);
  }

  @Post('status-changed')
  sendStatusChanged(@Body() body: { orderNumber: string; clientEmail: string; clientName: string; status: string }) {
    return this.emailService.sendStatusChanged(body.orderNumber, body.clientEmail, body.clientName, body.status);
  }

  @Post('ready-for-pickup')
  sendReadyForPickup(@Body() body: { orderNumber: string; clientEmail: string; clientName: string }) {
    return this.emailService.sendReadyForPickup(body.orderNumber, body.clientEmail, body.clientName);
  }

  @Post('send-pdf')
  sendPdf(@Body() body: { email: string; orderNumber: string; type: 'ingreso' | 'entrega' }) {
    const subject = `Comprobante ServiCell - Orden ${body.orderNumber}`;
    const html = `<h1>ServiCell</h1><p>Adjunto encontrará el comprobante de la orden <strong>${body.orderNumber}</strong>.</p><hr/><p><small>ServiCell - Sistema de reparación de dispositivos móviles</small></p>`;
    return this.emailService.sendEmailWithPdf(body.email, subject, html, body.orderNumber, body.type);
  }
}
