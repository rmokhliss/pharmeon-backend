import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { ProductsModule } from './products/products.module';
import { StockModule } from './stock/stock.module';
import { ClientsModule } from './clients/clients.module';
import { FournisseursModule } from './fournisseurs/fournisseurs.module';
import { AuthModule } from './auth/auth.module';
import { CommandesModule } from './commandes/commandes.module';
import { DemandesModule } from './demandes/demandes.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { DeliveryNotesModule } from './delivery-notes/delivery-notes.module';
import { InvoicesModule } from './invoices/invoices.module';
import { AdjustmentsModule } from './adjustments/adjustments.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ProductsModule,
    StockModule,
    ClientsModule,
    FournisseursModule,
    AuthModule,
    CommandesModule,
    DemandesModule,
    PurchaseOrdersModule,
    DeliveryNotesModule,
    InvoicesModule,
    AdjustmentsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
