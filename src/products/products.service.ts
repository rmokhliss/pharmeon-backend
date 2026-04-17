import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private filterPriceByRole(product: any, role?: string): any {
    if (role === 'ADMIN') return product;

    const costPrice = product.cost_price ?? product.prix_achat ?? 0;
    const retailPrice = product.retail_price ?? product.prix_vente ?? 0;
    const wholesalePrice = product.wholesale_price || retailPrice;
    const retailDiscount = product.retail_discount_pct || 0;
    const wholesaleDiscount = product.wholesale_discount_pct || 0;

    // Strip cost fields
    const { cost_price, prix_achat, ...rest } = product;

    if (role === 'PRO') {
      const { wholesale_discount_pct, ...proRest } = rest;
      return {
        ...proRest,
        price: Math.round(wholesalePrice * (1 - wholesaleDiscount / 100) * 100) / 100,
        price_type: 'wholesale',
      };
    }

    // CLIENT_PUBLIC: strip wholesale fields too
    const { wholesale_price, wholesale_discount_pct, ...publicRest } = rest;
    return {
      ...publicRest,
      price: Math.round(retailPrice * (1 - retailDiscount / 100) * 100) / 100,
      price_type: 'retail',
    };
  }

  async findAll(search?: string, categorie?: string, role?: string) {
    const products = await this.prisma.product.findMany({
      where: {
        actif: true,
        ...(search && {
          OR: [
            { nom: { contains: search, mode: 'insensitive' } },
            { marque: { contains: search, mode: 'insensitive' } },
            { reference: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(categorie && { categorie }),
      },
      orderBy: { nom: 'asc' },
    });
    return products.map((p) => this.filterPriceByRole(p, role));
  }

  getCategories() {
    return this.prisma.product.findMany({
      where: { actif: true },
      select: { categorie: true },
      distinct: ['categorie'],
      orderBy: { categorie: 'asc' },
    });
  }

  async findOne(id: number, role?: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException(`Produit #${id} introuvable`);
    return this.filterPriceByRole(product, role);
  }

  create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...dto,
        cost_price: dto.cost_price ?? dto.prix_achat,
        retail_price: dto.retail_price ?? dto.prix_vente,
        wholesale_price: dto.wholesale_price ?? dto.prix_vente ?? 0,
      },
    });
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.prisma.product.findFirstOrThrow({ where: { id } });
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.prisma.product.findFirstOrThrow({ where: { id } });
    return this.prisma.product.update({ where: { id }, data: { actif: false } });
  }
}
