import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private prisma: PrismaService) {}

  private async initTransporter() {
    if (this.transporter) return;
    try {
      const config = await this.prisma.companyConfig.findFirst();
      if (config?.smtpHost && config?.smtpUser && config?.smtpPass) {
        this.transporter = nodemailer.createTransport({
          host: config.smtpHost,
          port: config.smtpPort || 587,
          secure: config.smtpPort === 465,
          auth: { user: config.smtpUser, pass: config.smtpPass },
        });
        this.logger.log('Email transporter initialized');
      } else {
        this.logger.warn('SMTP not configured');
      }
    } catch (error) {
      this.logger.warn(`Email transporter unavailable: ${(error as Error).message}`);
    }
  }

  async sendOrderCreated(orderNumber: string, clientEmail: string, clientName: string) {
    const subject = `Orden de servicio creada - ${orderNumber}`;
    const html = this.buildHtml(clientName, orderNumber, 'ha sido creada exitosamente.');
    return this.sendEmailWithPdf(clientEmail, subject, html, orderNumber, 'ingreso');
  }

  async sendStatusChanged(orderNumber: string, clientEmail: string, clientName: string, status: string) {
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
    const subject = `Estado de orden actualizado - ${orderNumber}`;
    const html = `
      <h1>Hola ${clientName}</h1>
      <p>El estado de tu orden <strong>${orderNumber}</strong> ha cambiado a:</p>
      <h2 style="color: #1976D2;">${statusLabels[status] || status}</h2>
      <p>Puedes dar seguimiento a tu orden en cualquier momento.</p>
      <hr/>
      <p><small>ServiCell - Sistema de reparación de dispositivos móviles</small></p>
    `;
    return this.sendEmail(clientEmail, subject, html);
  }

  async sendReadyForPickup(orderNumber: string, clientEmail: string, clientName: string) {
    const subject = `Tu equipo está listo - ${orderNumber}`;
    const html = this.buildHtml(clientName, orderNumber, 'está listo para entrega.');
    return this.sendEmailWithPdf(clientEmail, subject, html, orderNumber, 'entrega');
  }

  async sendEmailWithPdf(
    to: string,
    subject: string,
    html: string,
    orderNumber: string,
    pdfType: 'ingreso' | 'entrega',
  ) {
    const config = await this.prisma.companyConfig.findFirst();
    const from = config?.email || 'noreply@servicell.com';

    if (!this.transporter) await this.initTransporter();
    if (!this.transporter) {
      this.logger.warn('Cannot send email: SMTP not configured');
      return { message: 'SMTP not configured' };
    }

    const pdfPath = path.resolve(process.cwd(), `uploads/pdfs/order-${orderNumber}-${pdfType}.pdf`);
    const attachments: any[] = [];

    if (fs.existsSync(pdfPath)) {
      attachments.push({
        filename: `orden-${orderNumber}-${pdfType}.pdf`,
        path: pdfPath,
      });
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      this.logger.log(`Email sent to ${to}: ${info.messageId}`);
      return { message: 'Email sent', messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Failed to send email: ${(error as Error).message}`);
      throw error;
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    const config = await this.prisma.companyConfig.findFirst();
    const from = config?.email || 'noreply@servicell.com';

    if (!this.transporter) await this.initTransporter();
    if (!this.transporter) {
      this.logger.warn('Cannot send email: SMTP not configured');
      return { message: 'SMTP not configured' };
    }

    try {
      const info = await this.transporter.sendMail({ from, to, subject, html });
      this.logger.log(`Email sent to ${to}: ${info.messageId}`);
      return { message: 'Email sent', messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Failed to send email: ${(error as Error).message}`);
      throw error;
    }
  }

  private buildHtml(clientName: string, orderNumber: string, action: string) {
    return `
      <h1>Hola ${clientName}</h1>
      <p>Tu orden de servicio <strong>${orderNumber}</strong> ${action}</p>
      <p>Encuentra adjunto el comprobante en formato PDF.</p>
      <hr/>
      <p><small>ServiCell - Sistema de reparación de dispositivos móviles</small></p>
    `;
  }
}
