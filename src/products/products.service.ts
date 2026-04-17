import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  findAll(search?: string, categorie?: string) {
    return this.prisma.product.findMany({
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
  }

  getCategories() {
    return this.prisma.product.findMany({
      where: { actif: true },
      select: { categorie: true },
      distinct: ['categorie'],
      orderBy: { categorie: 'asc' },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException(`Produit #${id} introuvable`);
    return product;
  }

  create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.update({ where: { id }, data: { actif: false } });
  }
}
