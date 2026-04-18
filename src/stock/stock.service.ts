import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  findAll(productId?: number) {
    return this.prisma.stockMovement.findMany({
      where: productId ? { productId } : undefined,
      include: {
        product: { select: { nom: true, reference: true, unite: true } },
        client: { select: { nom: true } },
        fournisseur: { select: { nom: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}
