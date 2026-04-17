import { Module } from '@nestjs/common';
import { CommandesController } from './commandes.controller';
import { CommandesService } from './commandes.service';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CommandesController],
  providers: [CommandesService, PrismaService],
})
export class CommandesModule {}
