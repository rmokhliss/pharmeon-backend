import { Module } from '@nestjs/common';
import { CommandesController } from './commandes.controller';
import { CommandesService } from './commandes.service';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [AuthModule, PdfModule],
  controllers: [CommandesController],
  providers: [CommandesService, PrismaService],
})
export class CommandesModule {}
