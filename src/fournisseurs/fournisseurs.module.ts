import { Module } from '@nestjs/common';
import { FournisseursController } from './fournisseurs.controller';
import { FournisseursService } from './fournisseurs.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [FournisseursController],
  providers: [FournisseursService, PrismaService],
})
export class FournisseursModule {}
