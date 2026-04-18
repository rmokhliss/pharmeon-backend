import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { PrismaService } from '../prisma.service';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [PdfModule],
  controllers: [InvoicesController],
  providers: [InvoicesService, PrismaService],
})
export class InvoicesModule {}
