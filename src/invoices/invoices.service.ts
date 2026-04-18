import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

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
    const validStatuts = ['BROUILLON', 'EMISE', 'PAYEE', 'ANNULEE'];
    return this.prisma.facture.update({ where: { id }, data: { statut } });
  }
}
