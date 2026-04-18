import { Module } from '@nestjs/common';
import { DeliveryNotesController } from './delivery-notes.controller';
import { DeliveryNotesService } from './delivery-notes.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [DeliveryNotesController],
  providers: [DeliveryNotesService, PrismaService],
})
export class DeliveryNotesModule {}
