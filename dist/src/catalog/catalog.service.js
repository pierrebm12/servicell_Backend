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
let CatalogService = CatalogService_1 = class CatalogService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CatalogService_1.name);
    }
    async onModuleInit() {
        await this.seed();
    }
    async seed() {
        const dtCount = await this.prisma.deviceType.count();
        if (dtCount > 0)
            return;
        const phone = await this.prisma.deviceType.create({ data: { name: 'Teléfono', icon: 'cellphone' } });
        const tablet = await this.prisma.deviceType.create({ data: { name: 'Tablet', icon: 'tablet' } });
        await this.prisma.deviceType.create({ data: { name: 'Watch', icon: 'watch' } });
        await this.prisma.deviceType.create({ data: { name: 'iPod Touch', icon: 'ipod' } });
        await this.prisma.deviceType.create({ data: { name: 'Computadora', icon: 'laptop' } });
        await this.prisma.deviceType.create({ data: { name: 'AirPods', icon: 'headphones' } });
        const apple = await this.prisma.brand.create({ data: { name: 'Apple' } });
        const samsung = await this.prisma.brand.create({ data: { name: 'Samsung' } });
        const oppo = await this.prisma.brand.create({ data: { name: 'Oppo' } });
        await this.prisma.brand.create({ data: { name: 'Xiaomi' } });
        await this.prisma.brand.create({ data: { name: 'Motorola' } });
        await this.prisma.brand.create({ data: { name: 'Huawei' } });
        await this.prisma.brand.create({ data: { name: 'LG' } });
        await this.prisma.brand.create({ data: { name: 'Sony' } });
        await this.prisma.deviceModel.create({ data: { name: 'iPhone 12', deviceTypeId: phone.id, brandId: apple.id } });
        await this.prisma.deviceModel.create({ data: { name: 'iPhone 13', deviceTypeId: phone.id, brandId: apple.id } });
        await this.prisma.deviceModel.create({ data: { name: 'iPhone 14', deviceTypeId: phone.id, brandId: apple.id } });
        await this.prisma.deviceModel.create({ data: { name: 'iPhone 15', deviceTypeId: phone.id, brandId: apple.id } });
        await this.prisma.deviceModel.create({ data: { name: 'iPhone 16', deviceTypeId: phone.id, brandId: apple.id } });
        await this.prisma.deviceModel.create({ data: { name: 'iPad Pro', deviceTypeId: tablet.id, brandId: apple.id } });
        await this.prisma.deviceModel.create({ data: { name: 'iPad Air', deviceTypeId: tablet.id, brandId: apple.id } });
        await this.prisma.deviceModel.create({ data: { name: 'Galaxy S22', deviceTypeId: phone.id, brandId: samsung.id } });
        await this.prisma.deviceModel.create({ data: { name: 'Galaxy S23', deviceTypeId: phone.id, brandId: samsung.id } });
        await this.prisma.deviceModel.create({ data: { name: 'Galaxy S24', deviceTypeId: phone.id, brandId: samsung.id } });
        await this.prisma.deviceModel.create({ data: { name: 'Galaxy Tab S9', deviceTypeId: tablet.id, brandId: samsung.id } });
        await this.prisma.deviceModel.create({ data: { name: 'Find X5', deviceTypeId: phone.id, brandId: oppo.id } });
        await this.prisma.deviceModel.create({ data: { name: 'Find X6', deviceTypeId: phone.id, brandId: oppo.id } });
        await this.prisma.serviceType.create({ data: { name: 'Batería' } });
        await this.prisma.serviceType.create({ data: { name: 'LCD / Pantalla' } });
        await this.prisma.serviceType.create({ data: { name: 'Diagnóstico' } });
        await this.prisma.serviceType.create({ data: { name: 'Puerto de carga' } });
        await this.prisma.serviceType.create({ data: { name: 'Garantía' } });
        await this.prisma.serviceType.create({ data: { name: 'Daño por agua' } });
        await this.prisma.serviceType.create({ data: { name: 'Microsoldadura' } });
        await this.prisma.serviceType.create({ data: { name: 'Destello / Programación' } });
        await this.prisma.serviceType.create({ data: { name: 'Otro' } });
    }
    async getDeviceTypes() { return this.prisma.deviceType.findMany({ orderBy: { name: 'asc' } }); }
    async getBrands() { return this.prisma.brand.findMany({ orderBy: { name: 'asc' } }); }
    async getModels(deviceTypeId, brandId) {
        const where = {};
        if (deviceTypeId)
            where.deviceTypeId = deviceTypeId;
        if (brandId)
            where.brandId = brandId;
        return this.prisma.deviceModel.findMany({ where, include: { deviceType: true, brand: true }, orderBy: { name: 'asc' } });
    }
    async getServiceTypes() { return this.prisma.serviceType.findMany({ orderBy: { name: 'asc' } }); }
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