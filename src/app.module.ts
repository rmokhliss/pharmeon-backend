import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { ProductsModule } from './products/products.module';
import { StockModule } from './stock/stock.module';
import { ClientsModule } from './clients/clients.module';
import { FournisseursModule } from './fournisseurs/fournisseurs.module';
import { AuthModule } from './auth/auth.module';
import { CommandesModule } from './commandes/commandes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ProductsModule,
    StockModule,
    ClientsModule,
    FournisseursModule,
    AuthModule,
    CommandesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
