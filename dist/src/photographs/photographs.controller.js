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
exports.PhotographsController = void 0;
const common_1 = require("@nestjs/common");
const photographs_service_1 = require("./photographs.service");
const create_photograph_dto_1 = require("./dto/create-photograph.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let PhotographsController = class PhotographsController {
    constructor(photographsService) {
        this.photographsService = photographsService;
    }
    create(dto) {
        return this.photographsService.create(dto);
    }
    findByOrder(orderId) {
        return this.photographsService.findByOrder(orderId);
    }
    remove(id) {
        return this.photographsService.remove(id);
    }
};
exports.PhotographsController = PhotographsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_photograph_dto_1.CreatePhotographDto]),
    __metadata("design:returntype", void 0)
], PhotographsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('order/:orderId'),
    __param(0, (0, common_1.Param)('orderId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PhotographsController.prototype, "findByOrder", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PhotographsController.prototype, "remove", null);
exports.PhotographsController = PhotographsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('photographs'),
    __metadata("design:paramtypes", [photographs_service_1.PhotographsService])
], PhotographsController);
//# sourceMappingURL=photographs.controller.js.map