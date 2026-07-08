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
var WhatsappController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappController = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_service_1 = require("./whatsapp.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let WhatsappController = WhatsappController_1 = class WhatsappController {
    constructor(whatsappService) {
        this.whatsappService = whatsappService;
        this.logger = new common_1.Logger(WhatsappController_1.name);
    }
    sendOrderConfirmation(body) {
        return this.whatsappService.sendOrderConfirmation(body.phone, body.orderNumber);
    }
    sendApprovalRequest(body) {
        return this.whatsappService.sendApprovalRequest(body.phone, body.orderNumber, body.cost);
    }
    sendReadyForPickup(body) {
        return this.whatsappService.sendReadyForPickup(body.phone, body.orderNumber);
    }
    sendStatusUpdate(body) {
        return this.whatsappService.sendStatusUpdate(body.phone, body.orderNumber, body.status);
    }
    async sendPdf(body) {
        return this.whatsappService.sendOrderPdf(body.phone, body.orderNumber, body.type, 'Comprobante ServiCell');
    }
};
exports.WhatsappController = WhatsappController;
__decorate([
    (0, common_1.Post)('order-confirmation'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "sendOrderConfirmation", null);
__decorate([
    (0, common_1.Post)('approval-request'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "sendApprovalRequest", null);
__decorate([
    (0, common_1.Post)('ready-for-pickup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "sendReadyForPickup", null);
__decorate([
    (0, common_1.Post)('status-update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "sendStatusUpdate", null);
__decorate([
    (0, common_1.Post)('send-pdf'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "sendPdf", null);
exports.WhatsappController = WhatsappController = WhatsappController_1 = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('whatsapp'),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsappService])
], WhatsappController);
//# sourceMappingURL=whatsapp.controller.js.map