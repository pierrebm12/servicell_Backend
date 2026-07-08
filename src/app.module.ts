import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { EquipmentModule } from './equipment/equipment.module';
import { OrdersModule } from './orders/orders.module';
import { DiagnosticsModule } from './diagnostics/diagnostics.module';
import { PhotographsModule } from './photographs/photographs.module';
import { SignaturesModule } from './signatures/signatures.module';
import { PdfModule } from './pdf/pdf.module';
import { QrModule } from './qr/qr.module';
import { EmailModule } from './email/email.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { InventoryModule } from './inventory/inventory.module';
import { ReportsModule } from './reports/reports.module';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CatalogModule } from './catalog/catalog.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    EquipmentModule,
    OrdersModule,
    DiagnosticsModule,
    PhotographsModule,
    SignaturesModule,
    PdfModule,
    QrModule,
    EmailModule,
    WhatsappModule,
    InventoryModule,
    ReportsModule,
    AppConfigModule,
    CloudinaryModule,
    CatalogModule,
    UploadModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
