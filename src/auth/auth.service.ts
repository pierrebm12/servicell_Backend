import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    const roleMap: Record<string, string> = { ADMIN: 'admin', TECNICO: 'tech', RECEPCION: 'receptionist' };
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleMap[user.role] || user.role.toLowerCase(),
        phone: user.phone,
        photoUrl: user.photoUrl || null,
      },
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logged out successfully' };
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }
    // In production, send email with reset token
    return { message: 'If the email exists, a reset link has been sent' };
  }

  private async generateTokens(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return { accessToken, refreshToken };
  }

  async seedTestData() {
    const existing = await this.prisma.client.count();
    if (existing > 0) return { message: 'Ya existen datos de prueba' };

    const client1 = await this.prisma.client.create({
      data: { name: 'Carlos Mendoza', document: '1001234567', phone: '3001234567', email: 'carlos@email.com' },
    });
    const client2 = await this.prisma.client.create({
      data: { name: 'María García', document: '1007654321', phone: '3107654321', email: 'maria@email.com' },
    });
    const client3 = await this.prisma.client.create({
      data: { name: 'Pedro Martínez', document: '1005551234', phone: '3205551234' },
    });
    const client4 = await this.prisma.client.create({
      data: { name: 'Ana López', document: '1004445678', phone: '3014445678', email: 'ana@email.com' },
    });

    const equip1 = await this.prisma.equipment.create({
      data: { brand: 'Apple', model: 'iPhone 13', imei: '351234567891234', color: 'Negro', serial: 'SN12345' },
    });
    const equip2 = await this.prisma.equipment.create({
      data: { brand: 'Samsung', model: 'Galaxy S23', imei: '359876543210987', color: 'Verde', serial: 'SN67890' },
    });
    const equip3 = await this.prisma.equipment.create({
      data: { brand: 'Apple', model: 'iPhone 14 Pro', imei: '351112223334445', color: 'Morado' },
    });
    const equip4 = await this.prisma.equipment.create({
      data: { brand: 'Xiaomi', model: 'Redmi Note 12', imei: '356667778889990', color: 'Azul' },
    });

    const [dt, brand, sv] = await Promise.all([
      this.prisma.deviceType.findFirst(),
      this.prisma.brand.findFirst(),
      this.prisma.serviceType.findFirst(),
    ]);

    const userId = 1;

    const order1 = await this.prisma.serviceOrder.create({
      data: {
        orderNumber: 'ORD-2025-000001',
        reportedFault: 'Batería se descarga muy rápido',
        observations: 'Cliente indica que la batería dura menos de 2 horas',
        physicalState: 'Golpe en esquina superior derecha',
        devicePassword: '1234',
        status: 'EN_REPARACION',
        estimatedCost: 250000,
        clientId: client1.id,
        equipmentId: equip1.id,
        createdById: userId,
        assignedToId: 3,
        deviceTypeId: dt?.id,
        brandId: brand?.id,
        serviceTypeId: sv?.id,
        laborCost: 50000,
      },
    });

    const order2 = await this.prisma.serviceOrder.create({
      data: {
        orderNumber: 'ORD-2025-000002',
        reportedFault: 'Pantalla rota por caída',
        observations: 'LCD completamente estrellado, no táctil',
        status: 'RECIBIDO',
        estimatedCost: 450000,
        clientId: client2.id,
        equipmentId: equip2.id,
        createdById: userId,
        deviceTypeId: dt?.id,
        serviceTypeId: sv?.id,
      },
    });

    const order3 = await this.prisma.serviceOrder.create({
      data: {
        orderNumber: 'ORD-2025-000003',
        reportedFault: 'No enciende',
        observations: 'Se mojó con agua, posible daño en placa',
        status: 'DIAGNOSTICO',
        estimatedCost: 350000,
        clientId: client3.id,
        equipmentId: equip3.id,
        createdById: userId,
        assignedToId: 3,
      },
    });

    const order4 = await this.prisma.serviceOrder.create({
      data: {
        orderNumber: 'ORD-2025-000004',
        reportedFault: 'Puerto de carga no funciona',
        observations: 'No reconoce el cargador, se mueve el conector',
        physicalState: 'Rayones en pantalla',
        status: 'RECIBIDO',
        estimatedCost: 80000,
        clientId: client4.id,
        equipmentId: equip4.id,
        createdById: userId,
      },
    });

    await this.prisma.orderStatus.createMany({
      data: [
        { orderId: order1.id, toStatus: 'RECIBIDO', userId },
        { orderId: order1.id, toStatus: 'EN_REPARACION', userId, fromStatus: 'RECIBIDO' },
        { orderId: order2.id, toStatus: 'RECIBIDO', userId },
        { orderId: order3.id, toStatus: 'RECIBIDO', userId },
        { orderId: order3.id, toStatus: 'DIAGNOSTICO', userId, fromStatus: 'RECIBIDO' },
        { orderId: order4.id, toStatus: 'RECIBIDO', userId },
      ],
    });

    await this.prisma.repairNote.create({
      data: {
        content: 'Se realizó prueba de batería. Batería hinchada, requiere reemplazo. Se procede con cambio.',
        step: 'diagnostico',
        orderId: order1.id,
        userId,
      },
    });

    const inventoryItems = [
      { name: 'Batería iPhone 11', reference: 'BH-11', category: 'Baterías', brand: 'Apple', quality: 'original', quantity: 10, minStock: 2, salePrice: 45000 },
      { name: 'Batería iPhone 12', reference: 'BH-12', category: 'Baterías', brand: 'Apple', quality: 'original', quantity: 8, minStock: 2, salePrice: 55000 },
      { name: 'Batería iPhone 13', reference: 'BH-13', category: 'Baterías', brand: 'Apple', quality: 'original', quantity: 5, minStock: 2, salePrice: 65000 },
      { name: 'Batería Galaxy S22', reference: 'BH-S22', category: 'Baterías', brand: 'Samsung', quality: 'original', quantity: 6, minStock: 2, salePrice: 50000 },
      { name: 'Batería Galaxy S23', reference: 'BH-S23', category: 'Baterías', brand: 'Samsung', quality: 'original', quantity: 4, minStock: 2, salePrice: 60000 },
      { name: 'LCD iPhone 11 Negro', reference: 'LCD-11-N', category: 'Pantallas', brand: 'Apple', quality: 'original', quantity: 3, minStock: 1, salePrice: 120000 },
      { name: 'LCD iPhone 12 Negro', reference: 'LCD-12-N', category: 'Pantallas', brand: 'Apple', quality: 'original', quantity: 2, minStock: 1, salePrice: 150000 },
      { name: 'LCD iPhone 13 Negro', reference: 'LCD-13-N', category: 'Pantallas', brand: 'Apple', quality: 'original', quantity: 2, minStock: 1, salePrice: 180000 },
      { name: 'LCD Galaxy S22', reference: 'LCD-S22', category: 'Pantallas', brand: 'Samsung', quality: 'original', quantity: 2, minStock: 1, salePrice: 140000 },
      { name: 'Pin de carga iPhone', reference: 'PIN-IP', category: 'Carga', brand: 'Apple', quality: 'original', quantity: 15, minStock: 3, salePrice: 25000 },
      { name: 'Pin de carga USB-C', reference: 'PIN-USBC', category: 'Carga', brand: 'Genérico', quality: 'alternativo', quantity: 20, minStock: 5, salePrice: 12000 },
      { name: 'Parlante iPhone 11', reference: 'PAR-11', category: 'Parlantes', brand: 'Apple', quality: 'original', quantity: 4, minStock: 2, salePrice: 35000 },
      { name: 'Parlante iPhone 12', reference: 'PAR-12', category: 'Parlantes', brand: 'Apple', quality: 'original', quantity: 3, minStock: 2, salePrice: 38000 },
      { name: 'Micrófono iPhone 11', reference: 'MIC-11', category: 'Micrófonos', brand: 'Apple', quality: 'original', quantity: 5, minStock: 2, salePrice: 28000 },
      { name: 'Flex botón volumen iPhone', reference: 'FLEX-VOL', category: 'Flexibles', brand: 'Apple', quality: 'original', quantity: 6, minStock: 2, salePrice: 18000 },
      { name: 'Cámara trasera iPhone 12', reference: 'CAM-12', category: 'Cámaras', brand: 'Apple', quality: 'original', quantity: 2, minStock: 1, salePrice: 65000 },
      { name: 'Cámara frontal iPhone 13', reference: 'CAM-FR-13', category: 'Cámaras', brand: 'Apple', quality: 'original', quantity: 3, minStock: 1, salePrice: 45000 },
    ];
    await this.prisma.inventoryItem.createMany({ data: inventoryItems });

    return {
      message: 'Datos de prueba creados exitosamente',
      clients: [client1, client2, client3, client4],
      orders: [order1, order2, order3, order4],
      inventoryItems: inventoryItems.length,
    };
  }
}
