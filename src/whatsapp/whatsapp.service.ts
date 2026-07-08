import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(private prisma: PrismaService) {}

  private async getConfig() {
    const config = await this.prisma.companyConfig.findFirst();
    return {
      token: config?.whatsappToken,
      phoneId: config?.whatsappPhoneId,
    };
  }

  async sendOrderConfirmation(phone: string, orderNumber: string) {
    return this.sendOrderPdf(phone, orderNumber, 'ingreso', 'Comprobante de ingreso');
  }

  async sendApprovalRequest(phone: string, orderNumber: string, cost: number) {
    const message = `Tu orden *${orderNumber}* requiere aprobación. El costo estimado del diagnóstico es *$${cost.toFixed(2)}*. Por favor acércate a nuestro local para aprobar o contáctanos.`;
    return this.sendMessage(phone, message);
  }

  async sendReadyForPickup(phone: string, orderNumber: string) {
    return this.sendOrderPdf(phone, orderNumber, 'entrega', 'Comprobante de entrega');
  }

  async sendStatusUpdate(phone: string, orderNumber: string, status: string) {
    const statusLabels: Record<string, string> = {
      RECIBIDO: 'Recibido',
      DIAGNOSTICO: 'En diagnóstico',
      ESPERANDO_APROBACION: 'Esperando aprobación',
      ESPERANDO_REPUESTO: 'Esperando repuesto',
      EN_REPARACION: 'En reparación',
      REPARADO: 'Reparado',
      LISTO_ENTREGA: 'Listo para entrega',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado',
    };
    const message = `Tu orden *${orderNumber}* ha cambiado de estado: *${statusLabels[status] || status}*.`;
    return this.sendMessage(phone, message);
  }

  async sendOrderPdf(phone: string, orderNumber: string, type: 'ingreso' | 'entrega', caption: string) {
    const { token, phoneId } = await this.getConfig();
    if (!token || !phoneId) {
      this.logger.warn('WhatsApp not configured');
      return { message: 'WhatsApp not configured' };
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const pdfPath = path.resolve(process.cwd(), `uploads/pdfs/order-${orderNumber}-${type}.pdf`);

    if (!fs.existsSync(pdfPath)) {
      this.logger.warn(`PDF not found: ${pdfPath}, sending text instead`);
      return this.sendMessage(phone, `Tu documento de la orden *${orderNumber}* está disponible en nuestro local.`);
    }

    try {
      const pdfBuffer = fs.readFileSync(pdfPath);
      const boundary = '----Boundary' + Date.now();

      // Upload media to WhatsApp
      const body = this.buildMultipart(boundary, pdfBuffer, 'application/pdf', 'comprobante.pdf');
      const uploadRes = await fetch(
        `https://graph.facebook.com/v18.0/${phoneId}/media`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
          },
          body: body as any,
        },
      );

      const uploadData = await uploadRes.json() as any;
      if (!uploadRes.ok) {
        this.logger.error(`WhatsApp media upload error: ${JSON.stringify(uploadData)}`);
        return this.sendMessage(phone, `📄 Tu comprobante: orden ${orderNumber}`);
      }

      const mediaId = uploadData.id;
      this.logger.log(`WhatsApp media uploaded: ${mediaId}`);

      // Send document message
      const sendRes = await fetch(
        `https://graph.facebook.com/v18.0/${phoneId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanPhone,
            type: 'document',
            document: {
              id: mediaId,
              caption,
              filename: `orden-${orderNumber}-${type}.pdf`,
            },
          }),
        },
      );

      const sendData = await sendRes.json() as any;
      if (!sendRes.ok) {
        this.logger.error(`WhatsApp document send error: ${JSON.stringify(sendData)}`);
        throw new Error(sendData.error?.message || 'WhatsApp document send failed');
      }

      this.logger.log(`WhatsApp PDF sent to ${cleanPhone}`);
      return { message: 'PDF sent', id: sendData.messages?.[0]?.id };
    } catch (error) {
      this.logger.error(`Failed to send PDF via WhatsApp: ${(error as Error).message}`);
      return this.sendMessage(phone, `📄 Tu comprobante de la orden *${orderNumber}*: disponible en nuestro local.`);
    }
  }

  async sendMessage(to: string, message: string) {
    const { token, phoneId } = await this.getConfig();
    if (!token || !phoneId) {
      this.logger.warn('WhatsApp not configured');
      return { message: 'WhatsApp not configured' };
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${phoneId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: to.replace(/[^0-9]/g, ''),
            type: 'text',
            text: { body: message },
          }),
        },
      );

      const data = await response.json() as any;
      if (!response.ok) {
        this.logger.error(`WhatsApp API error: ${JSON.stringify(data)}`);
        throw new Error(data.error?.message || 'WhatsApp send failed');
      }

      this.logger.log(`WhatsApp message sent to ${to}`);
      return { message: 'Message sent', id: data.messages?.[0]?.id };
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp: ${(error as Error).message}`);
      throw error;
    }
  }

  private buildMultipart(boundary: string, buffer: Buffer, mimeType: string, filename: string): Buffer {
    const header = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
      `Content-Type: ${mimeType}\r\n\r\n`
    );
    const footer = Buffer.from(
      `\r\n--${boundary}\r\n` +
      `Content-Disposition: form-data; name="type"\r\n\r\n` +
      `${mimeType}\r\n` +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="messaging_product"\r\n\r\n` +
      `whatsapp\r\n` +
      `--${boundary}--\r\n`
    );
    return Buffer.concat([header, buffer, footer]);
  }
}
