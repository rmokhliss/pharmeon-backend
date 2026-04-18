import { Module } from '@nestjs/common';
import { LivreursController } from './livreurs.controller';
import { LivreursService } from './livreurs.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [LivreursController],
  providers: [LivreursService, PrismaService],
})
export class LivreursModule {}
