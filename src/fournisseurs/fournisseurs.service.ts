import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateFournisseurDto, UpdateFournisseurDto } from './dto/fournisseur.dto';

@Injectable()
export class FournisseursService {
  constructor(private prisma: PrismaService) {}

  findAll(search?: string) {
    return this.prisma.fournisseur.findMany({
      where: {
        actif: true,
        ...(search && { nom: { contains: search, mode: 'insensitive' } }),
      },
      orderBy: { nom: 'asc' },
    });
  }

  async findOne(id: number) {
    const f = await this.prisma.fournisseur.findUnique({ where: { id } });
    if (!f) throw new NotFoundException(`Fournisseur #${id} introuvable`);
    return f;
  }

  create(dto: CreateFournisseurDto) {
    return this.prisma.fournisseur.create({ data: dto });
  }

  async update(id: number, dto: UpdateFournisseurDto) {
    await this.findOne(id);
    return this.prisma.fournisseur.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.fournisseur.update({ where: { id }, data: { actif: false } });
  }
}
