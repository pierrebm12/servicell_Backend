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
exports.EmailController = void 0;
const common_1 = require("@nestjs/common");
const email_service_1 = require("./email.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let EmailController = class EmailController {
    constructor(emailService) {
        this.emailService = emailService;
    }
    sendOrderCreated(body) {
        return this.emailService.sendOrderCreated(body.orderNumber, body.clientEmail, body.clientName);
    }
    sendStatusChanged(body) {
        return this.emailService.sendStatusChanged(body.orderNumber, body.clientEmail, body.clientName, body.status);
    }
    sendReadyForPickup(body) {
        return this.emailService.sendReadyForPickup(body.orderNumber, body.clientEmail, body.clientName);
    }
    sendPdf(body) {
        const subject = `Comprobante ServiCell - Orden ${body.orderNumber}`;
        const html = `<h1>ServiCell</h1><p>Adjunto encontrará el comprobante de la orden <strong>${body.orderNumber}</strong>.</p><hr/><p><small>ServiCell - Sistema de reparación de dispositivos móviles</small></p>`;
        return this.emailService.sendEmailWithPdf(body.email, subject, html, body.orderNumber, body.type);
    }
};
exports.EmailController = EmailController;
__decorate([
    (0, common_1.Post)('order-created'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EmailController.prototype, "sendOrderCreated", null);
__decorate([
    (0, common_1.Post)('status-changed'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EmailController.prototype, "sendStatusChanged", null);
__decorate([
    (0, common_1.Post)('ready-for-pickup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EmailController.prototype, "sendReadyForPickup", null);
__decorate([
    (0, common_1.Post)('send-pdf'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EmailController.prototype, "sendPdf", null);
exports.EmailController = EmailController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('email'),
    __metadata("design:paramtypes", [email_service_1.EmailService])
], EmailController);
//# sourceMappingURL=email.controller.js.map