import { Module } from '@nestjs/common';
import { AdjustmentsController } from './adjustments.controller';
import { AdjustmentsService } from './adjustments.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [AdjustmentsController],
  providers: [AdjustmentsService, PrismaService],
})
export class AdjustmentsModule {}
