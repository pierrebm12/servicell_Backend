import { Controller, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('order-confirmation')
  sendOrderConfirmation(@Body() body: { phone: string; orderNumber: string }) {
    return this.whatsappService.sendOrderConfirmation(body.phone, body.orderNumber);
  }

  @Post('approval-request')
  sendApprovalRequest(@Body() body: { phone: string; orderNumber: string; cost: number }) {
    return this.whatsappService.sendApprovalRequest(body.phone, body.orderNumber, body.cost);
  }

  @Post('ready-for-pickup')
  sendReadyForPickup(@Body() body: { phone: string; orderNumber: string }) {
    return this.whatsappService.sendReadyForPickup(body.phone, body.orderNumber);
  }

  @Post('status-update')
  sendStatusUpdate(@Body() body: { phone: string; orderNumber: string; status: string }) {
    return this.whatsappService.sendStatusUpdate(body.phone, body.orderNumber, body.status);
  }

  @Post('send-pdf')
  async sendPdf(@Body() body: { phone: string; orderNumber: string; type: 'ingreso' | 'entrega' }) {
    return this.whatsappService.sendOrderPdf(body.phone, body.orderNumber, body.type, 'Comprobante ServiCell');
  }
}
