"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const clients_module_1 = require("./clients/clients.module");
const equipment_module_1 = require("./equipment/equipment.module");
const orders_module_1 = require("./orders/orders.module");
const diagnostics_module_1 = require("./diagnostics/diagnostics.module");
const photographs_module_1 = require("./photographs/photographs.module");
const signatures_module_1 = require("./signatures/signatures.module");
const pdf_module_1 = require("./pdf/pdf.module");
const qr_module_1 = require("./qr/qr.module");
const email_module_1 = require("./email/email.module");
const whatsapp_module_1 = require("./whatsapp/whatsapp.module");
const inventory_module_1 = require("./inventory/inventory.module");
const reports_module_1 = require("./reports/reports.module");
const config_module_1 = require("./config/config.module");
const cloudinary_module_1 = require("./cloudinary/cloudinary.module");
const catalog_module_1 = require("./catalog/catalog.module");
const upload_module_1 = require("./upload/upload.module");
const versions_module_1 = require("./versions/versions.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            clients_module_1.ClientsModule,
            equipment_module_1.EquipmentModule,
            orders_module_1.OrdersModule,
            diagnostics_module_1.DiagnosticsModule,
            photographs_module_1.PhotographsModule,
            signatures_module_1.SignaturesModule,
            pdf_module_1.PdfModule,
            qr_module_1.QrModule,
            email_module_1.EmailModule,
            whatsapp_module_1.WhatsappModule,
            inventory_module_1.InventoryModule,
            reports_module_1.ReportsModule,
            config_module_1.ConfigModule,
            cloudinary_module_1.CloudinaryModule,
            catalog_module_1.CatalogModule,
            upload_module_1.UploadModule,
            versions_module_1.VersionsModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map