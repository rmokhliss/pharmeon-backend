import { Module } from '@nestjs/common';
import { DeliveryNotesService } from './delivery-notes.service';
import { DeliveryNotesController } from './delivery-notes.controller';
import { PrismaService } from '../prisma.service';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [PdfModule],
  controllers: [DeliveryNotesController],
  providers: [DeliveryNotesService, PrismaService],
})
export class DeliveryNotesModule {}
