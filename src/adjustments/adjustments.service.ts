import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

type CreateAdjDto = {
  type: string;
  note?: string;
  items: { productId: number; quantite: number; cost_price: number }[];
};

@Injectable()
export class AdjustmentsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.stockAdjustement.findMany({
      include: { items: { include: { product: { select: { nom: true, reference: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.stockAdjustement.findFirstOrThrow({
      where: { id },
      include: { items: { include: { product: true } } },
    });
  }

  create(dto: CreateAdjDto) {
    const validTypes = ['EXPIRATION', 'DOMMAGE', 'PERTE', 'RETOUR'];
    if (!validTypes.includes(dto.type)) throw new BadRequestException('Type invalide');
    const reference = `ADJ-${Date.now()}`;
    return this.prisma.stockAdjustement.create({
      data: {
        reference, type: dto.type, note: dto.note,
        items: { create: dto.items.map((i) => ({ productId: i.productId, quantite: i.quantite, cost_price: i.cost_price })) },
      },
      include: { items: { include: { product: { select: { nom: true, reference: true } } } } },
    });
  }

  async validate(id: number) {
    const adj = await this.prisma.stockAdjustement.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!adj) throw new NotFoundException();
    if (adj.statut !== 'EN_ATTENTE') throw new BadRequestException('Ajustement déjà traité');

    const isRetour = adj.type === 'RETOUR';
    const movType = isRetour ? 'ENTREE' : 'SORTIE';

    const ops = adj.items.flatMap((item) => [
      this.prisma.stockMovement.create({
        data: {
          type: movType, quantite: item.quantite, productId: item.productId,
          note: `Ajustement ${adj.type} - ${adj.reference}`,
          source: 'ADJUSTMENT', sourceId: adj.id,
        },
      }),
      this.prisma.product.update({
        where: { id: item.productId },
        data: { stock: isRetour ? { increment: item.quantite } : { decrement: item.quantite } },
      }),
    ]);

    await this.prisma.$transaction([
      ...ops,
      this.prisma.stockAdjustement.update({ where: { id }, data: { statut: 'VALIDEE' } }),
    ]);
    return this.findOne(id);
  }

  async reject(id: number) {
    await this.prisma.stockAdjustement.findFirstOrThrow({ where: { id } });
    return this.prisma.stockAdjustement.update({ where: { id }, data: { statut: 'REJETEE' } });
  }
}
