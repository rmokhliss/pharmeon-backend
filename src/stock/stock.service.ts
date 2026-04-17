import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMovementDto } from './dto/create-movement.dto';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  findAll(productId?: number) {
    return this.prisma.stockMovement.findMany({
      where: productId ? { productId } : undefined,
      include: { product: { select: { nom: true, reference: true, unite: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async create(dto: CreateMovementDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException(`Produit #${dto.productId} introuvable`);

    if (dto.type === 'SORTIE' && product.stock < dto.quantite) {
      throw new BadRequestException(
        `Stock insuffisant. Disponible: ${product.stock}, demandé: ${dto.quantite}`,
      );
    }

    const delta = dto.type === 'ENTREE' ? dto.quantite : -dto.quantite;

    const [movement] = await this.prisma.$transaction([
      this.prisma.stockMovement.create({ data: dto }),
      this.prisma.product.update({
        where: { id: dto.productId },
        data: { stock: { increment: delta } },
      }),
    ]);

    return movement;
  }
}
