import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PdfService } from '../pdf/pdf.service';

type CreatePODto = {
  fournisseurId: number;
  note?: string;
  expected_date?: string;
  items: { productId: number; quantite: number; prix_achat: number }[];
};

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService, private pdf: PdfService) {}

  async generatePdf(id: number): Promise<string> {
    const po = await this.prisma.bonCommandeFournisseur.findUnique({
      where: { id },
      include: {
        fournisseur: true,
        items: { include: { product: { select: { nom: true, reference: true, unite: true } } } },
      },
    });
    if (!po) throw new NotFoundException(`Bon de commande #${id} introuvable`);
    return this.pdf.generatePurchaseOrderHtml(po);
  }

  findAll() {
    return this.prisma.bonCommandeFournisseur.findMany({
      include: {
        fournisseur: { select: { nom: true } },
        items: { include: { product: { select: { nom: true, reference: true, unite: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.bonCommandeFournisseur.findFirstOrThrow({
      where: { id },
      include: {
        fournisseur: true,
        items: { include: { product: { select: { nom: true, reference: true, unite: true } } } },
        mouvements: { select: { id: true, type: true, quantite: true, createdAt: true } },
      },
    });
  }

  create(dto: CreatePODto) {
    const reference = `PO-${Date.now()}`;
    return this.prisma.bonCommandeFournisseur.create({
      data: {
        reference,
        fournisseurId: dto.fournisseurId,
        note: dto.note,
        expected_date: dto.expected_date ? new Date(dto.expected_date) : null,
        items: { create: dto.items.map((i) => ({ productId: i.productId, quantite: i.quantite, prix_achat: i.prix_achat })) },
      },
      include: {
        fournisseur: { select: { nom: true } },
        items: { include: { product: { select: { nom: true, reference: true, unite: true } } } },
      },
    });
  }

  async updateStatut(id: number, statut: string) {
    const validStatuts = ['BROUILLON', 'ENVOYEE', 'CONFIRMEE', 'LIVREE', 'ANNULEE'];
    if (!validStatuts.includes(statut)) throw new BadRequestException('Statut invalide');

    const po = await this.prisma.bonCommandeFournisseur.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!po) throw new NotFoundException(`Bon de commande #${id} introuvable`);

    if (statut === 'LIVREE' && po.statut !== 'LIVREE') {
      const ops = po.items.flatMap((item) => [
        this.prisma.stockMovement.create({
          data: {
            type: 'ENTREE',
            quantite: item.quantite,
            productId: item.productId,
            fournisseurId: po.fournisseurId,
            bonCommandeId: po.id,
            note: `BC Fournisseur ${po.reference}`,
            source: 'PO',
            sourceId: po.id,
          },
        }),
        this.prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantite },
            cost_price: item.prix_achat,
            prix_achat: item.prix_achat,
          },
        }),
      ]);
      await this.prisma.$transaction([
        ...ops,
        this.prisma.bonCommandeFournisseur.update({ where: { id }, data: { statut } }),
      ]);
    } else {
      await this.prisma.bonCommandeFournisseur.update({ where: { id }, data: { statut } });
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    const po = await this.prisma.bonCommandeFournisseur.findUnique({ where: { id } });
    if (!po) throw new NotFoundException();
    if (po.statut !== 'BROUILLON') throw new BadRequestException('Seuls les brouillons peuvent être supprimés');
    await this.prisma.bonCommandeFournisseurItem.deleteMany({ where: { bonId: id } });
    return this.prisma.bonCommandeFournisseur.delete({ where: { id } });
  }
}
