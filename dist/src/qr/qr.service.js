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
var QrService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrService = void 0;
const common_1 = require("@nestjs/common");
const QRCode = __importStar(require("qrcode"));
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let QrService = QrService_1 = class QrService {
    constructor(prisma, cloudinary) {
        this.prisma = prisma;
        this.cloudinary = cloudinary;
        this.logger = new common_1.Logger(QrService_1.name);
    }
    async generateQr(orderId) {
        const order = await this.prisma.serviceOrder.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const apiUrl = process.env.API_URL || 'http://localhost:3000';
        const url = `${apiUrl}/api/v1/pdf/public/${order.orderNumber}`;
        const qrBuffer = await QRCode.toBuffer(url, {
            width: 400,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
        });
        const result = await this.cloudinary.uploadImage(qrBuffer, 'qrcodes', `qr-${order.orderNumber}`);
        return result.secure_url;
    }
    async getQrImage(orderNumber) {
        const order = await this.prisma.serviceOrder.findUnique({ where: { orderNumber } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const apiUrl = process.env.API_URL || 'http://localhost:3000';
        const url = `${apiUrl}/api/v1/pdf/public/${orderNumber}`;
        return QRCode.toBuffer(url, { width: 400, margin: 2 });
    }
    async getOrderInfo(orderNumber) {
        const order = await this.prisma.serviceOrder.findUnique({
            where: { orderNumber },
            include: {
                client: { select: { name: true, document: true, phone: true } },
                equipment: true,
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return {
            orderNumber: order.orderNumber,
            status: order.status,
            reportedFault: order.reportedFault,
            estimatedDate: order.estimatedDate,
            client: order.client,
            equipment: {
                brand: order.equipment.brand,
                model: order.equipment.model,
                imei: order.equipment.imei,
            },
        };
    }
};
exports.QrService = QrService;
exports.QrService = QrService = QrService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], QrService);
//# sourceMappingURL=qr.service.js.map