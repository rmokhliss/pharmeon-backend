import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

type CreateCommandeDto = {
  note?: string;
  items: { productId: number; quantite: number }[];
};

@Injectable()
export class CommandesService {
  constructor(private prisma: PrismaService) {}

  async create(clientId: number, dto: CreateCommandeDto) {
    if (!dto.items?.length) throw new BadRequestException('Panier vide');

    const products = await this.prisma.product.findMany({
      where: { id: { in: dto.items.map((i) => i.productId) }, actif: true },
    });

    const reference = `CMD-${Date.now()}`;

    return this.prisma.commande.create({
      data: {
        reference,
        clientId,
        note: dto.note,
        items: {
          create: dto.items.map((item) => {
            const p = products.find((p) => p.id === item.productId);
            if (!p) throw new BadRequestException(`Produit #${item.productId} introuvable`);
            return { productId: item.productId, quantite: item.quantite, prixUnitaire: p.prix_vente };
          }),
        },
      },
      include: { items: { include: { product: { select: { nom: true, reference: true, unite: true } } } }, client: { select: { nom: true } } },
    });
  }

  findByClient(clientId: number) {
    return this.prisma.commande.findMany({
      where: { clientId },
      include: { items: { include: { product: { select: { nom: true, reference: true, unite: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number, clientId?: number) {
    return this.prisma.commande.findFirstOrThrow({
      where: { id, ...(clientId ? { clientId } : {}) },
      include: {
        items: { include: { product: { select: { nom: true, reference: true, unite: true, prix_vente: true } } } },
        client: { select: { nom: true, ville: true, telephone: true } },
      },
    });
  }

  findAll() {
    return this.prisma.commande.findMany({
      include: {
        client: { select: { nom: true, ville: true, type: true } },
        items: { include: { product: { select: { nom: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatut(id: number, statut: string) {
    const validStatuts = ['EN_ATTENTE', 'VALIDEE', 'EN_COURS', 'LIVREE', 'ANNULEE'];
    if (!validStatuts.includes(statut)) throw new BadRequestException('Statut invalide');

    const commande = await this.prisma.commande.findUnique({ where: { id }, include: { items: true } });
    if (!commande) throw new NotFoundException(`Commande #${id} introuvable`);

    if (statut === 'VALIDEE' && commande.statut === 'EN_ATTENTE') {
      // Generate stock exits for each item
      const ops = commande.items.flatMap((item) => [
        this.prisma.stockMovement.create({
          data: { type: 'SORTIE', quantite: item.quantite, productId: item.productId, clientId: commande.clientId, note: `Commande ${commande.reference}` },
        }),
        this.prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantite } } }),
      ]);
      await this.prisma.$transaction([
        ...ops,
        this.prisma.commande.update({ where: { id }, data: { statut } }),
      ]);
    } else {
      await this.prisma.commande.update({ where: { id }, data: { statut } });
    }

    return this.findOne(id);
  }
}
