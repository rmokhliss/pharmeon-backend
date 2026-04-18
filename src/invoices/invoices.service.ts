import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PdfService } from '../pdf/pdf.service';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private pdf: PdfService,
  ) {}

  findAll() {
    return this.prisma.facture.findMany({
      include: {
        commande: { select: { reference: true, client: { select: { nom: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.facture.findFirstOrThrow({
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

  findByCommande(commandeId: number) {
    return this.prisma.facture.findFirst({
      where: { commandeId },
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

  async updateStatut(id: number, statut: string) {
    return this.prisma.facture.update({ where: { id }, data: { statut } });
  }

  async generatePdf(id: number): Promise<string> {
    const facture = await this.findOne(id);
    return this.pdf.generateInvoiceHtml(facture as any);
  }
}
