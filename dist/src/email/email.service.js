"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
const prisma_service_1 = require("../prisma/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let EmailService = EmailService_1 = class EmailService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.transporter = null;
    }
    async initTransporter() {
        if (this.transporter)
            return;
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
            }
            else {
                this.logger.warn('SMTP not configured');
            }
        }
        catch (error) {
            this.logger.warn(`Email transporter unavailable: ${error.message}`);
        }
    }
    async sendOrderCreated(orderNumber, clientEmail, clientName) {
        const subject = `Orden de servicio creada - ${orderNumber}`;
        const html = this.buildHtml(clientName, orderNumber, 'ha sido creada exitosamente.');
        return this.sendEmailWithPdf(clientEmail, subject, html, orderNumber, 'ingreso');
    }
    async sendStatusChanged(orderNumber, clientEmail, clientName, status) {
        const statusLabels = {
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
    async sendReadyForPickup(orderNumber, clientEmail, clientName) {
        const subject = `Tu equipo está listo - ${orderNumber}`;
        const html = this.buildHtml(clientName, orderNumber, 'está listo para entrega.');
        return this.sendEmailWithPdf(clientEmail, subject, html, orderNumber, 'entrega');
    }
    async sendEmailWithPdf(to, subject, html, orderNumber, pdfType) {
        const config = await this.prisma.companyConfig.findFirst();
        const from = config?.email || 'noreply@servicell.com';
        if (!this.transporter)
            await this.initTransporter();
        if (!this.transporter) {
            this.logger.warn('Cannot send email: SMTP not configured');
            return { message: 'SMTP not configured' };
        }
        const pdfPath = path.resolve(process.cwd(), `uploads/pdfs/order-${orderNumber}-${pdfType}.pdf`);
        const attachments = [];
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
        }
        catch (error) {
            this.logger.error(`Failed to send email: ${error.message}`);
            throw error;
        }
    }
    async sendEmail(to, subject, html) {
        const config = await this.prisma.companyConfig.findFirst();
        const from = config?.email || 'noreply@servicell.com';
        if (!this.transporter)
            await this.initTransporter();
        if (!this.transporter) {
            this.logger.warn('Cannot send email: SMTP not configured');
            return { message: 'SMTP not configured' };
        }
        try {
            const info = await this.transporter.sendMail({ from, to, subject, html });
            this.logger.log(`Email sent to ${to}: ${info.messageId}`);
            return { message: 'Email sent', messageId: info.messageId };
        }
        catch (error) {
            this.logger.error(`Failed to send email: ${error.message}`);
            throw error;
        }
    }
    buildHtml(clientName, orderNumber, action) {
        return `
      <h1>Hola ${clientName}</h1>
      <p>Tu orden de servicio <strong>${orderNumber}</strong> ${action}</p>
      <p>Encuentra adjunto el comprobante en formato PDF.</p>
      <hr/>
      <p><small>ServiCell - Sistema de reparación de dispositivos móviles</small></p>
    `;
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmailService);
//# sourceMappingURL=email.service.js.map