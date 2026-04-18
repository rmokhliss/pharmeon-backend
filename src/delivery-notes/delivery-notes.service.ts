import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DeliveryNotesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.bonLivraison.findMany({
      include: {
        commande: {
          select: { reference: true, client: { select: { nom: true, ville: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByCommande(commandeId: number) {
    return this.prisma.bonLivraison.findFirst({
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

  async update(id: number, data: { tracking_number?: string; delivery_date?: string; statut?: string }) {
    await this.prisma.bonLivraison.findFirstOrThrow({ where: { id } });
    return this.prisma.bonLivraison.update({
      where: { id },
      data: {
        ...(data.tracking_number !== undefined && { tracking_number: data.tracking_number }),
        ...(data.statut !== undefined && { statut: data.statut }),
        ...(data.delivery_date !== undefined && { delivery_date: new Date(data.delivery_date) }),
      },
    });
  }
}
