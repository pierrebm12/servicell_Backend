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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogController = void 0;
const common_1 = require("@nestjs/common");
const catalog_service_1 = require("./catalog.service");
const create_catalog_dto_1 = require("./dto/create-catalog.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let CatalogController = class CatalogController {
    constructor(catalogService) {
        this.catalogService = catalogService;
    }
    getDeviceTypes() { return this.catalogService.getDeviceTypes(); }
    getBrands() { return this.catalogService.getBrands(); }
    getModels(deviceTypeId, brandId) {
        return this.catalogService.getModels(deviceTypeId ? +deviceTypeId : undefined, brandId ? +brandId : undefined);
    }
    getServiceTypes() { return this.catalogService.getServiceTypes(); }
    createDeviceType(dto) { return this.catalogService.createDeviceType(dto); }
    createBrand(dto) { return this.catalogService.createBrand(dto); }
    createModel(dto) { return this.catalogService.createModel(dto); }
    createServiceType(dto) { return this.catalogService.createServiceType(dto); }
};
exports.CatalogController = CatalogController;
__decorate([
    (0, common_1.Get)('device-types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "getDeviceTypes", null);
__decorate([
    (0, common_1.Get)('brands'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "getBrands", null);
__decorate([
    (0, common_1.Get)('models'),
    __param(0, (0, common_1.Query)('deviceTypeId')),
    __param(1, (0, common_1.Query)('brandId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "getModels", null);
__decorate([
    (0, common_1.Get)('service-types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "getServiceTypes", null);
__decorate([
    (0, common_1.Post)('device-types'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_catalog_dto_1.CreateDeviceTypeDto]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "createDeviceType", null);
__decorate([
    (0, common_1.Post)('brands'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_catalog_dto_1.CreateBrandDto]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "createBrand", null);
__decorate([
    (0, common_1.Post)('models'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_catalog_dto_1.CreateDeviceModelDto]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "createModel", null);
__decorate([
    (0, common_1.Post)('service-types'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_catalog_dto_1.CreateServiceTypeDto]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "createServiceType", null);
exports.CatalogController = CatalogController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('catalog'),
    __metadata("design:paramtypes", [catalog_service_1.CatalogService])
], CatalogController);
//# sourceMappingURL=catalog.controller.js.map