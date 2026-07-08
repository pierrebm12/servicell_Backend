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
var WhatsappService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let WhatsappService = WhatsappService_1 = class WhatsappService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(WhatsappService_1.name);
    }
    async getConfig() {
        const config = await this.prisma.companyConfig.findFirst();
        return {
            token: config?.whatsappToken,
            phoneId: config?.whatsappPhoneId,
        };
    }
    async sendOrderConfirmation(phone, orderNumber) {
        return this.sendOrderPdf(phone, orderNumber, 'ingreso', 'Comprobante de ingreso');
    }
    async sendApprovalRequest(phone, orderNumber, cost) {
        const message = `Tu orden *${orderNumber}* requiere aprobación. El costo estimado del diagnóstico es *$${cost.toFixed(2)}*. Por favor acércate a nuestro local para aprobar o contáctanos.`;
        return this.sendMessage(phone, message);
    }
    async sendReadyForPickup(phone, orderNumber) {
        return this.sendOrderPdf(phone, orderNumber, 'entrega', 'Comprobante de entrega');
    }
    async sendStatusUpdate(phone, orderNumber, status) {
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
        const message = `Tu orden *${orderNumber}* ha cambiado de estado: *${statusLabels[status] || status}*.`;
        return this.sendMessage(phone, message);
    }
    async sendOrderPdf(phone, orderNumber, type, caption) {
        const { token, phoneId } = await this.getConfig();
        if (!token || !phoneId) {
            this.logger.warn('WhatsApp not configured');
            return { message: 'WhatsApp not configured' };
        }
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const pdfPath = path.resolve(process.cwd(), `uploads/pdfs/order-${orderNumber}-${type}.pdf`);
        if (!fs.existsSync(pdfPath)) {
            this.logger.warn(`PDF not found: ${pdfPath}, sending text instead`);
            return this.sendMessage(phone, `Tu documento de la orden *${orderNumber}* está disponible en nuestro local.`);
        }
        try {
            const pdfBuffer = fs.readFileSync(pdfPath);
            const boundary = '----Boundary' + Date.now();
            const body = this.buildMultipart(boundary, pdfBuffer, 'application/pdf', 'comprobante.pdf');
            const uploadRes = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/media`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': `multipart/form-data; boundary=${boundary}`,
                },
                body: body,
            });
            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) {
                this.logger.error(`WhatsApp media upload error: ${JSON.stringify(uploadData)}`);
                return this.sendMessage(phone, `📄 Tu comprobante: orden ${orderNumber}`);
            }
            const mediaId = uploadData.id;
            this.logger.log(`WhatsApp media uploaded: ${mediaId}`);
            const sendRes = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: cleanPhone,
                    type: 'document',
                    document: {
                        id: mediaId,
                        caption,
                        filename: `orden-${orderNumber}-${type}.pdf`,
                    },
                }),
            });
            const sendData = await sendRes.json();
            if (!sendRes.ok) {
                this.logger.error(`WhatsApp document send error: ${JSON.stringify(sendData)}`);
                throw new Error(sendData.error?.message || 'WhatsApp document send failed');
            }
            this.logger.log(`WhatsApp PDF sent to ${cleanPhone}`);
            return { message: 'PDF sent', id: sendData.messages?.[0]?.id };
        }
        catch (error) {
            this.logger.error(`Failed to send PDF via WhatsApp: ${error.message}`);
            return this.sendMessage(phone, `📄 Tu comprobante de la orden *${orderNumber}*: disponible en nuestro local.`);
        }
    }
    async sendMessage(to, message) {
        const { token, phoneId } = await this.getConfig();
        if (!token || !phoneId) {
            this.logger.warn('WhatsApp not configured');
            return { message: 'WhatsApp not configured' };
        }
        try {
            const response = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: to.replace(/[^0-9]/g, ''),
                    type: 'text',
                    text: { body: message },
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                this.logger.error(`WhatsApp API error: ${JSON.stringify(data)}`);
                throw new Error(data.error?.message || 'WhatsApp send failed');
            }
            this.logger.log(`WhatsApp message sent to ${to}`);
            return { message: 'Message sent', id: data.messages?.[0]?.id };
        }
        catch (error) {
            this.logger.error(`Failed to send WhatsApp: ${error.message}`);
            throw error;
        }
    }
    buildMultipart(boundary, buffer, mimeType, filename) {
        const header = Buffer.from(`--${boundary}\r\n` +
            `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
            `Content-Type: ${mimeType}\r\n\r\n`);
        const footer = Buffer.from(`\r\n--${boundary}\r\n` +
            `Content-Disposition: form-data; name="type"\r\n\r\n` +
            `${mimeType}\r\n` +
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="messaging_product"\r\n\r\n` +
            `whatsapp\r\n` +
            `--${boundary}--\r\n`);
        return Buffer.concat([header, buffer, footer]);
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = WhatsappService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map