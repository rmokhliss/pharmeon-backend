import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PdfService } from '../pdf/pdf.service';

@Injectable()
export class DeliveryNotesService {
  constructor(
    private prisma: PrismaService,
    private pdf: PdfService,
  ) {}

  findAll() {
    return this.prisma.bonLivraison.findMany({
      include: {
        commande: { select: { reference: true, client: { select: { nom: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.bonLivraison.findFirstOrThrow({
      where: { id },
      include: {
        commande: {
          include: {
            items: { include: { product: { select: { nom: true, reference: true, unite: true } } } },
            client: { select: { nom: true, ville: true, telephone: true, adresse: true } },
          },
        },
      },
    });
  }

  async generatePdf(id: number): Promise<string> {
    const bl = await this.findOne(id);
    return this.pdf.generateDeliveryNoteHtml(bl as any);
  }
}
