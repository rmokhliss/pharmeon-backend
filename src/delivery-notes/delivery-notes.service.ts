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
        livreur: { select: { id: true, nom: true, telephone: true, vehicule: true } },
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
        livreur: true,
      },
    });
  }

  async assignLivreur(id: number, livreurId: number | null) {
    await this.prisma.bonLivraison.findFirstOrThrow({ where: { id } });
    if (livreurId !== null) {
      await this.prisma.livreur.findFirstOrThrow({ where: { id: livreurId } });
    }
    return this.prisma.bonLivraison.update({
      where: { id },
      data: { livreurId },
      include: { livreur: true },
    });
  }

  async update(id: number, data: { delivery_date?: string; tracking_number?: string; statut?: string; livreurId?: number | null }) {
    await this.prisma.bonLivraison.findFirstOrThrow({ where: { id } });
    return this.prisma.bonLivraison.update({
      where: { id },
      data: {
        ...(data.delivery_date !== undefined && { delivery_date: data.delivery_date ? new Date(data.delivery_date) : null }),
        ...(data.tracking_number !== undefined && { tracking_number: data.tracking_number || null }),
        ...(data.statut !== undefined && { statut: data.statut }),
        ...(data.livreurId !== undefined && { livreurId: data.livreurId }),
      },
      include: { livreur: true },
    });
  }

  async generatePdf(id: number): Promise<string> {
    const bl = await this.findOne(id);
    return this.pdf.generateDeliveryNoteHtml(bl as any);
  }
}
