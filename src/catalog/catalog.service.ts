import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceTypeDto, CreateBrandDto, CreateDeviceModelDto, CreateServiceTypeDto } from './dto/create-catalog.dto';

const EXCLUDED_DEVICE_TYPES = ['Computadora', 'iPod Touch'];
const EXCLUDED_SERVICES = ['Batería', 'correoGoogle', 'Daño por agua', 'LCD Pantalla', 'destello programacion', 'Microsoldadura', 'puerto de carga', 'flex de linterna'];

@Injectable()
export class CatalogService implements OnModuleInit {
  private readonly logger = new Logger(CatalogService.name);
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.migrateExisting();
    await this.seed();
  }

  private async migrateExisting() {
    const brands = await this.prisma.brand.findMany();
    for (const b of brands) {
      const upper = b.name.toUpperCase();
      if (b.name !== upper) {
        await this.prisma.brand.update({ where: { id: b.id }, data: { name: upper } });
      }
    }
    const models = await this.prisma.deviceModel.findMany();
    for (const m of models) {
      const upper = m.name.toUpperCase();
      if (m.name !== upper) {
        await this.prisma.deviceModel.update({ where: { id: m.id }, data: { name: upper } });
      }
    }
    const services = await this.prisma.serviceType.findMany();
    for (const s of services) {
      const upper = s.name.toUpperCase();
      if (s.name !== upper) {
        await this.prisma.serviceType.update({ where: { id: s.id }, data: { name: upper } });
      }
    }
    const existingAudifonos = await this.prisma.deviceType.findFirst({ where: { name: 'Audífonos' } });
    if (!existingAudifonos) {
      await this.prisma.deviceType.create({ data: { name: 'Audífonos', icon: 'headphones' } });
    }
  }

  async seed() {
    const dtCount = await this.prisma.deviceType.count();
    if (dtCount > 0) return;

    const phone = await this.prisma.deviceType.create({ data: { name: 'Teléfono', icon: 'cellphone' } });
    const tablet = await this.prisma.deviceType.create({ data: { name: 'Tablet', icon: 'tablet' } });
    await this.prisma.deviceType.create({ data: { name: 'Watch', icon: 'watch' } });
    await this.prisma.deviceType.create({ data: { name: 'Audífonos', icon: 'headphones' } });
    await this.prisma.deviceType.create({ data: { name: 'AirPods', icon: 'headphones' } });

    const apple = await this.prisma.brand.create({ data: { name: 'APPLE' } });
    const samsung = await this.prisma.brand.create({ data: { name: 'SAMSUNG' } });
    const oppo = await this.prisma.brand.create({ data: { name: 'OPPO' } });
    await this.prisma.brand.create({ data: { name: 'XIAOMI' } });
    await this.prisma.brand.create({ data: { name: 'MOTOROLA' } });
    await this.prisma.brand.create({ data: { name: 'HUAWEI' } });
    await this.prisma.brand.create({ data: { name: 'LG' } });
    await this.prisma.brand.create({ data: { name: 'SONY' } });

    await this.prisma.deviceModel.create({ data: { name: 'IPHONE 12', deviceTypeId: phone.id, brandId: apple.id } });
    await this.prisma.deviceModel.create({ data: { name: 'IPHONE 13', deviceTypeId: phone.id, brandId: apple.id } });
    await this.prisma.deviceModel.create({ data: { name: 'IPHONE 14', deviceTypeId: phone.id, brandId: apple.id } });
    await this.prisma.deviceModel.create({ data: { name: 'IPHONE 15', deviceTypeId: phone.id, brandId: apple.id } });
    await this.prisma.deviceModel.create({ data: { name: 'IPHONE 16', deviceTypeId: phone.id, brandId: apple.id } });
    await this.prisma.deviceModel.create({ data: { name: 'IPAD PRO', deviceTypeId: tablet.id, brandId: apple.id } });
    await this.prisma.deviceModel.create({ data: { name: 'IPAD AIR', deviceTypeId: tablet.id, brandId: apple.id } });
    await this.prisma.deviceModel.create({ data: { name: 'GALAXY S22', deviceTypeId: phone.id, brandId: samsung.id } });
    await this.prisma.deviceModel.create({ data: { name: 'GALAXY S23', deviceTypeId: phone.id, brandId: samsung.id } });
    await this.prisma.deviceModel.create({ data: { name: 'GALAXY S24', deviceTypeId: phone.id, brandId: samsung.id } });
    await this.prisma.deviceModel.create({ data: { name: 'GALAXY TAB S9', deviceTypeId: tablet.id, brandId: samsung.id } });
    await this.prisma.deviceModel.create({ data: { name: 'FIND X5', deviceTypeId: phone.id, brandId: oppo.id } });
    await this.prisma.deviceModel.create({ data: { name: 'FIND X6', deviceTypeId: phone.id, brandId: oppo.id } });

    await this.prisma.serviceType.create({ data: { name: 'DIAGNÓSTICO' } });
    await this.prisma.serviceType.create({ data: { name: 'GARANTÍA' } });
    await this.prisma.serviceType.create({ data: { name: 'OTRO' } });
  }

  async getDeviceTypes() {
    const all = await this.prisma.deviceType.findMany({ orderBy: { name: 'asc' } });
    return all.filter(dt => !EXCLUDED_DEVICE_TYPES.includes(dt.name));
  }

  async getBrands() {
    return this.prisma.brand.findMany({ orderBy: { name: 'asc' } });
  }

  async getModels(deviceTypeId?: number, brandId?: number) {
    const where: any = {};
    if (deviceTypeId) where.deviceTypeId = deviceTypeId;
    if (brandId) where.brandId = brandId;
    return this.prisma.deviceModel.findMany({ where, include: { deviceType: true, brand: true }, orderBy: { name: 'asc' } });
  }

  async getServiceTypes() {
    const all = await this.prisma.serviceType.findMany({ orderBy: { name: 'asc' } });
    return all.filter(s => !EXCLUDED_SERVICES.includes(s.name));
  }

  async createDeviceType(dto: CreateDeviceTypeDto) { return this.prisma.deviceType.create({ data: dto }); }
  async createBrand(dto: CreateBrandDto) { return this.prisma.brand.create({ data: dto }); }
  async createModel(dto: CreateDeviceModelDto) {
    return this.prisma.deviceModel.create({ data: dto, include: { deviceType: true, brand: true } });
  }
  async createServiceType(dto: CreateServiceTypeDto) { return this.prisma.serviceType.create({ data: dto }); }
}
