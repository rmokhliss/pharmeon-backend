import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateClientDto, UpdateClientDto, RegisterClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  findAll(search?: string) {
    return this.prisma.client.findMany({
      where: {
        actif: true,
        ...(search && { nom: { contains: search, mode: 'insensitive' } }),
      },
      orderBy: { nom: 'asc' },
    });
  }

  async findOne(id: number) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException(`Client #${id} introuvable`);
    return client;
  }

  create(dto: CreateClientDto) {
    return this.prisma.client.create({ data: dto });
  }

  findPending() {
    return this.prisma.client.findMany({ where: { actif: false }, orderBy: { id: 'desc' } });
  }

  register(dto: RegisterClientDto) {
    return this.prisma.client.create({
      data: { nom: dto.nom, type: dto.type, email: dto.email, ville: dto.ville, telephone: dto.telephone, actif: false },
      select: { id: true, nom: true, email: true, type: true },
    });
  }

  pendingCount() {
    return this.prisma.client.count({ where: { actif: false } });
  }

  async update(id: number, dto: UpdateClientDto) {
    await this.findOne(id);
    return this.prisma.client.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.client.update({ where: { id }, data: { actif: false } });
  }
}
