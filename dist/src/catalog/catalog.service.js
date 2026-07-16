"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CatalogService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const EXCLUDED_DEVICE_TYPES = ['Computadora', 'iPod Touch'];
const EXCLUDED_SERVICES = ['Batería', 'correoGoogle', 'Daño por agua', 'LCD Pantalla', 'destello programacion', 'Microsoldadura', 'puerto de carga', 'flex de linterna'];
let CatalogService = CatalogService_1 = class CatalogService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CatalogService_1.name);
    }
    async onModuleInit() {
        await this.migrateExisting();
        await this.seed();
    }
    async migrateExisting() {
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
        if (dtCount > 0)
            return;
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
    async getModels(deviceTypeId, brandId) {
        const where = {};
        if (deviceTypeId)
            where.deviceTypeId = deviceTypeId;
        if (brandId)
            where.brandId = brandId;
        return this.prisma.deviceModel.findMany({ where, include: { deviceType: true, brand: true }, orderBy: { name: 'asc' } });
    }
    async getServiceTypes() {
        const all = await this.prisma.serviceType.findMany({ orderBy: { name: 'asc' } });
        return all.filter(s => !EXCLUDED_SERVICES.includes(s.name));
    }
    async createDeviceType(dto) { return this.prisma.deviceType.create({ data: dto }); }
    async createBrand(dto) { return this.prisma.brand.create({ data: dto }); }
    async createModel(dto) {
        return this.prisma.deviceModel.create({ data: dto, include: { deviceType: true, brand: true } });
    }
    async createServiceType(dto) { return this.prisma.serviceType.create({ data: dto }); }
};
exports.CatalogService = CatalogService;
exports.CatalogService = CatalogService = CatalogService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CatalogService);
//# sourceMappingURL=catalog.service.js.map