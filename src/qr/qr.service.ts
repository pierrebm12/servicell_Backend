import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class QrService {
  private readonly logger = new Logger(QrService.name);

  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async generateQr(orderId: number): Promise<string> {
    const order = await this.prisma.serviceOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const apiUrl = process.env.API_URL || 'http://localhost:3000';
    const url = `${apiUrl}/api/v1/pdf/public/${order.orderNumber}`;

    const qrBuffer = await QRCode.toBuffer(url, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });

    const result = await this.cloudinary.uploadImage(
      qrBuffer,
      'qrcodes',
      `qr-${order.orderNumber}`,
    );

    return result.secure_url;
  }

  async getQrImage(orderNumber: string): Promise<Buffer> {
    const order = await this.prisma.serviceOrder.findUnique({ where: { orderNumber } });
    if (!order) throw new NotFoundException('Order not found');

    const apiUrl = process.env.API_URL || 'http://localhost:3000';
    const url = `${apiUrl}/api/v1/pdf/public/${orderNumber}`;

    return QRCode.toBuffer(url, { width: 400, margin: 2 });
  }

  async getOrderInfo(orderNumber: string) {
    const order = await this.prisma.serviceOrder.findUnique({
      where: { orderNumber },
      include: {
        client: { select: { name: true, document: true, phone: true } },
        equipment: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      reportedFault: order.reportedFault,
      estimatedDate: order.estimatedDate,
      client: order.client,
      equipment: {
        brand: order.equipment.brand,
        model: order.equipment.model,
        imei: order.equipment.imei,
      },
    };
  }
}
