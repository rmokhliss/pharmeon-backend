import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [totalProduits, totalClients, totalCommandes, commandesEnAttente, stockBas, ruptures] =
      await Promise.all([
        this.prisma.product.count({ where: { actif: true } }),
        this.prisma.client.count({ where: { actif: true } }),
        this.prisma.commande.count(),
        this.prisma.commande.count({ where: { statut: 'EN_ATTENTE' } }),
        this.prisma.product.count({ where: { actif: true, stock: { gt: 0 } } }),
        this.prisma.product.count({ where: { actif: true, stock: 0 } }),
      ]);

    const livreedCommandes = await this.prisma.commande.findMany({
      where: { statut: 'LIVREE' },
      include: { items: { include: { product: { select: { cost_price: true, prix_achat: true } } } } },
    });

    let totalCA = 0;
    let totalMarge = 0;
    for (const c of livreedCommandes) {
      for (const item of c.items) {
        const price = item.final_price ?? item.prixUnitaire;
        const cost = item.product.cost_price ?? item.product.prix_achat ?? 0;
        totalCA += price * item.quantite;
        totalMarge += (price - cost) * item.quantite;
      }
    }

    const adjItems = await this.prisma.stockAdjustementItem.findMany({
      where: { adjustement: { statut: 'VALIDEE' } },
    });
    const totalPertes = adjItems.reduce((s, i) => s + i.cost_price * i.quantite, 0);

    return {
      totalProduits,
      totalClients,
      totalCommandes,
      commandesEnAttente,
      stockBas,
      ruptures,
      totalCA: Math.round(totalCA * 100) / 100,
      totalMarge: Math.round((totalMarge - totalPertes) * 100) / 100,
      totalPertes: Math.round(totalPertes * 100) / 100,
    };
  }

  async getProfitabilityByProduct() {
    const items = await this.prisma.commandeItem.findMany({
      where: { commande: { statut: 'LIVREE' } },
      include: { product: { select: { id: true, nom: true, reference: true, cost_price: true, prix_achat: true } } },
    });

    const map = new Map<number, { nom: string; reference: string; quantite: number; revenue: number; cost: number; marge: number }>();
    for (const item of items) {
      const price = item.final_price ?? item.prixUnitaire;
      const cost = item.product.cost_price ?? item.product.prix_achat ?? 0;
      const existing = map.get(item.productId) ?? { nom: item.product.nom, reference: item.product.reference, quantite: 0, revenue: 0, cost: 0, marge: 0 };
      existing.quantite += item.quantite;
      existing.revenue += price * item.quantite;
      existing.cost += cost * item.quantite;
      existing.marge += (price - cost) * item.quantite;
      map.set(item.productId, existing);
    }

    return Array.from(map.entries())
      .map(([id, data]) => ({ id, ...data, marge: Math.round(data.marge * 100) / 100 }))
      .sort((a, b) => b.marge - a.marge);
  }

  async getProfitabilityByClient() {
    const commandes = await this.prisma.commande.findMany({
      where: { statut: 'LIVREE' },
      include: {
        client: { select: { id: true, nom: true, type: true, role: true } },
        items: { include: { product: { select: { cost_price: true, prix_achat: true } } } },
      },
    });

    const map = new Map<number, { nom: string; type: string; totalCA: number; totalMarge: number; nbCommandes: number }>();
    for (const c of commandes) {
      const existing = map.get(c.clientId) ?? { nom: c.client.nom, type: c.client.type, totalCA: 0, totalMarge: 0, nbCommandes: 0 };
      existing.nbCommandes++;
      for (const item of c.items) {
        const price = item.final_price ?? item.prixUnitaire;
        const cost = item.product.cost_price ?? item.product.prix_achat ?? 0;
        existing.totalCA += price * item.quantite;
        existing.totalMarge += (price - cost) * item.quantite;
      }
      map.set(c.clientId, existing);
    }

    return Array.from(map.entries())
      .map(([id, d]) => ({ clientId: id, ...d, totalCA: Math.round(d.totalCA * 100) / 100, totalMarge: Math.round(d.totalMarge * 100) / 100 }))
      .sort((a, b) => b.totalCA - a.totalCA);
  }

  async getProfitabilityBySupplier() {
    const pos = await this.prisma.bonCommandeFournisseur.findMany({
      where: { statut: 'LIVREE' },
      include: { fournisseur: { select: { id: true, nom: true } }, items: true },
    });

    const map = new Map<number, { nom: string; totalAchats: number; nbCommandes: number }>();
    for (const po of pos) {
      const existing = map.get(po.fournisseurId) ?? { nom: po.fournisseur.nom, totalAchats: 0, nbCommandes: 0 };
      existing.nbCommandes++;
      for (const item of po.items) existing.totalAchats += item.prix_achat * item.quantite;
      map.set(po.fournisseurId, existing);
    }

    return Array.from(map.entries())
      .map(([id, d]) => ({ fournisseurId: id, ...d, totalAchats: Math.round(d.totalAchats * 100) / 100 }))
      .sort((a, b) => b.totalAchats - a.totalAchats);
  }

  async getLosses() {
    const adjustements = await this.prisma.stockAdjustement.findMany({
      where: { statut: 'VALIDEE' },
      include: { items: { include: { product: { select: { nom: true, reference: true } } } } },
      orderBy: { createdAt: 'desc' },
    });

    return adjustements.map((adj) => ({
      id: adj.id,
      reference: adj.reference,
      type: adj.type,
      createdAt: adj.createdAt,
      totalCost: Math.round(adj.items.reduce((s, i) => s + i.cost_price * i.quantite, 0) * 100) / 100,
      items: adj.items.map((i) => ({
        productNom: i.product.nom,
        quantite: i.quantite,
        cost_price: i.cost_price,
        totalLoss: Math.round(i.cost_price * i.quantite * 100) / 100,
      })),
    }));
  }
}
