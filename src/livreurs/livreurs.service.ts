import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateLivreurDto, UpdateLivreurDto } from './dto/livreur.dto';

@Injectable()
export class LivreursService {
  constructor(private prisma: PrismaService) {}

  findAll(search?: string, includeInactive = false) {
    return this.prisma.livreur.findMany({
      where: {
        ...(includeInactive ? {} : { actif: true }),
        ...(search && { nom: { contains: search, mode: 'insensitive' } }),
      },
      orderBy: { nom: 'asc' },
    });
  }

  async findOne(id: number) {
    const l = await this.prisma.livreur.findUnique({ where: { id } });
    if (!l) throw new NotFoundException(`Livreur #${id} introuvable`);
    return l;
  }

  create(dto: CreateLivreurDto) {
    return this.prisma.livreur.create({ data: dto });
  }

  async update(id: number, dto: UpdateLivreurDto) {
    await this.findOne(id);
    return this.prisma.livreur.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.livreur.update({ where: { id }, data: { actif: false } });
  }
}
