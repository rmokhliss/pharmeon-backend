import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PdfService } from '../pdf/pdf.service';

type CreateCommandeDto = {
  note?: string;
  items: { productId: number; quantite: number }[];
};

@Injectable()
export class CommandesService {
  constructor(private prisma: PrismaService, private pdf: PdfService) {}

  async generatePdf(id: number, clientId?: number): Promise<string> {
    const c = await this.prisma.commande.findFirstOrThrow({
      where: { id, ...(clientId ? { clientId } : {}) },
      include: {
        items: { include: { product: { select: { nom: true, reference: true, unite: true } } } },
        client: true,
      },
    });
    return this.pdf.generateCommandeClientHtml({
      reference: c.reference,
      statut: c.statut,
      note: c.note,
      createdAt: c.createdAt,
      client: {
        nom: c.client.nom,
        type: c.client.type,
        role: c.client.role,
        telephone: c.client.telephone,
        email: c.client.email,
        adresse: c.client.adresse,
        ville: c.client.ville,
        code_postal: c.client.code_postal,
        ice: c.client.ice,
        patente: c.client.patente,
        rc: c.client.rc,
        site_web: c.client.site_web,
      },
      items: c.items.map((i) => ({
        quantite: i.quantite,
        prixUnitaire: i.prixUnitaire,
        final_price: i.final_price,
        product: i.product,
      })),
    });
  }

  async create(clientId: number, dto: CreateCommandeDto, clientRole = 'CLIENT_PUBLIC') {
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
            const retailPrice = p.retail_price ?? p.prix_vente;
            const wholesalePrice = p.wholesale_price || retailPrice;
            const basePrice = clientRole === 'PRO' ? wholesalePrice : retailPrice;
            const discountPct = clientRole === 'PRO' ? (p.wholesale_discount_pct || 0) : (p.retail_discount_pct || 0);
            const finalP = Math.round(basePrice * (1 - discountPct / 100) * 100) / 100;
            return {
              productId: item.productId,
              quantite: item.quantite,
              prixUnitaire: finalP,
              original_price: finalP,
              final_price: finalP,
            };
          }),
        },
      },
      include: {
        items: { include: { product: { select: { nom: true, reference: true, unite: true } } } },
        client: { select: { nom: true } },
      },
    });
  }

  findByClient(clientId: number) {
    return this.prisma.commande.findMany({
      where: { clientId },
      include: {
        items: { include: { product: { select: { nom: true, reference: true, unite: true } } } },
        bonLivraison: { select: { delivery_date: true, tracking_number: true, statut: true, reference: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number, clientId?: number) {
    return this.prisma.commande.findFirstOrThrow({
      where: { id, ...(clientId ? { clientId } : {}) },
      include: {
        items: { include: { product: { select: { nom: true, reference: true, unite: true, retail_price: true, prix_vente: true } } } },
        client: { select: { nom: true, ville: true, telephone: true, type: true, role: true } },
        bonLivraison: true,
        facture: true,
      },
    });
  }

  pendingCount() {
    return this.prisma.commande.count({ where: { statut: 'EN_ATTENTE' } });
  }

  findAll() {
    return this.prisma.commande.findMany({
      include: {
        client: { select: { nom: true, ville: true, type: true, role: true } },
        items: {
          include: { product: { select: { nom: true } } },
        },
        bonLivraison: { select: { reference: true, tracking_number: true, delivery_date: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async assertEditable(commandeId: number) {
    const commande = await this.prisma.commande.findUnique({
      where: { id: commandeId },
      include: { client: { select: { role: true } } },
    });
    if (!commande) throw new NotFoundException(`Commande #${commandeId} introuvable`);
    if (commande.statut === 'LIVREE' || commande.statut === 'ANNULEE') {
      throw new BadRequestException('Impossible de modifier une commande livrée ou annulée');
    }
    return commande;
  }

  async updateItemPrice(commandeId: number, itemId: number, finalPrice: number) {
    await this.assertEditable(commandeId);
    return this.prisma.commandeItem.update({
      where: { id: itemId },
      data: { final_price: finalPrice, prixUnitaire: finalPrice },
    });
  }

  async updateItemQuantity(commandeId: number, itemId: number, quantite: number) {
    await this.assertEditable(commandeId);
    if (quantite < 1) throw new BadRequestException('Quantité doit être ≥ 1');
    return this.prisma.commandeItem.update({
      where: { id: itemId },
      data: { quantite },
    });
  }

  async addItem(commandeId: number, productId: number, quantite: number) {
    const commande = await this.assertEditable(commandeId);
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.actif) throw new BadRequestException(`Produit #${productId} introuvable`);
    if (quantite < 1) throw new BadRequestException('Quantité doit être ≥ 1');

    const clientRole = commande.client?.role || 'CLIENT_PUBLIC';
    const retailPrice = product.retail_price ?? product.prix_vente;
    const wholesalePrice = product.wholesale_price || retailPrice;
    const basePrice = clientRole === 'PRO' ? wholesalePrice : retailPrice;
    const discountPct = clientRole === 'PRO' ? (product.wholesale_discount_pct || 0) : (product.retail_discount_pct || 0);
    const finalP = Math.round(basePrice * (1 - discountPct / 100) * 100) / 100;

    return this.prisma.commandeItem.create({
      data: {
        commandeId, productId, quantite,
        prixUnitaire: finalP, original_price: finalP, final_price: finalP,
      },
      include: { product: { select: { nom: true, reference: true, unite: true } } },
    });
  }

  async removeItem(commandeId: number, itemId: number) {
    await this.assertEditable(commandeId);
    const item = await this.prisma.commandeItem.findUnique({ where: { id: itemId } });
    if (!item || item.commandeId !== commandeId) throw new NotFoundException(`Item #${itemId} introuvable`);
    await this.prisma.commandeItem.delete({ where: { id: itemId } });
    return { ok: true };
  }

  async generateBlPdf(commandeId: number, clientId?: number): Promise<string> {
    const commande = await this.prisma.commande.findFirstOrThrow({
      where: { id: commandeId, ...(clientId ? { clientId } : {}) },
      select: { id: true },
    });
    const bl = await this.prisma.bonLivraison.findFirst({
      where: { commandeId: commande.id },
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
    if (!bl) throw new NotFoundException(`Bon de livraison introuvable pour la commande #${commandeId}`);
    return this.pdf.generateDeliveryNoteHtml(bl as any);
  }

  async generateFacturePdf(commandeId: number, clientId?: number): Promise<string> {
    const commande = await this.prisma.commande.findFirstOrThrow({
      where: { id: commandeId, ...(clientId ? { clientId } : {}) },
      select: { id: true },
    });
    const facture = await this.prisma.facture.findFirst({
      where: { commandeId: commande.id },
      include: {
        commande: {
          include: {
            items: { include: { product: { select: { nom: true, reference: true, unite: true } } } },
            client: { select: { nom: true, ville: true, telephone: true, adresse: true } },
          },
        },
      },
    });
    if (!facture) throw new NotFoundException(`Facture introuvable pour la commande #${commandeId}`);
    return this.pdf.generateInvoiceHtml(facture as any);
  }

  async updateStatut(id: number, statut: string, extra?: { tracking_number?: string; delivery_date?: string; livreurId?: number | null }) {
    const validStatuts = ['EN_ATTENTE', 'VALIDEE', 'EN_COURS', 'LIVREE', 'ANNULEE'];
    if (!validStatuts.includes(statut)) throw new BadRequestException('Statut invalide');

    const commande = await this.prisma.commande.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, bonLivraison: true },
    });
    if (!commande) throw new NotFoundException(`Commande #${id} introuvable`);

    if (statut === 'LIVREE' && commande.statut !== 'LIVREE') {
      // Check stock availability
      for (const item of commande.items) {
        if (item.product.stock < item.quantite) {
          throw new BadRequestException(`Stock insuffisant pour ${item.product.nom} (disponible: ${item.product.stock})`);
        }
      }

      const blReference = `BL-${Date.now()}`;
      const facReference = `FAC-${Date.now()}`;
      const totalHT = commande.items.reduce((s, i) => {
        const price = i.final_price ?? i.prixUnitaire;
        return s + price * i.quantite;
      }, 0);

      // Only create stock movements if not already done (legacy orders)
      const existingMvt = await this.prisma.stockMovement.findFirst({
        where: { note: { contains: commande.reference } },
      });

      const stockOps = existingMvt ? [] : commande.items.flatMap((item) => {
        const price = item.final_price ?? item.prixUnitaire;
        return [
          this.prisma.stockMovement.create({
            data: {
              type: 'SORTIE', quantite: item.quantite, productId: item.productId,
              clientId: commande.clientId,
              note: `Commande ${commande.reference}`,
              source: 'COMMANDE', sourceId: commande.id,
            },
          }),
          this.prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantite } },
          }),
        ];
      });

      await this.prisma.$transaction([
        ...stockOps,
        ...(commande.bonLivraison ? [] : [this.prisma.bonLivraison.create({
          data: {
            reference: blReference,
            commandeId: id,
            tracking_number: extra?.tracking_number ?? null,
            delivery_date: extra?.delivery_date ? new Date(extra.delivery_date) : new Date(),
            livreurId: extra?.livreurId ?? null,
            statut: 'LIVRE',
          },
        })]),
        this.prisma.facture.upsert({
          where: { commandeId: id },
          create: {
            reference: facReference, commandeId: id,
            total_ht: Math.round(totalHT * 100) / 100,
            total_ttc: Math.round(totalHT * 1.2 * 100) / 100,
            statut: 'EMISE', issued_at: new Date(),
          },
          update: {},
        }),
        this.prisma.commande.update({ where: { id }, data: { statut } }),
      ]);
    } else {
      await this.prisma.commande.update({ where: { id }, data: { statut } });
    }

    return this.findOne(id);
  }
}
