import { Module } from '@nestjs/common';
import { DemandesController } from './demandes.controller';
import { DemandesService } from './demandes.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [DemandesController],
  providers: [DemandesService, PrismaService],
})
export class DemandesModule {}
