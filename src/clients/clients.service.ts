import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateClientDto, UpdateClientDto, RegisterClientDto } from './dto/client.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  private readonly safeSelect = {
    id: true, nom: true, type: true, role: true, telephone: true,
    ville: true, email: true, actif: true, approved: true, createdAt: true,
  };

  findAll(search?: string) {
    return this.prisma.client.findMany({
      where: {
        actif: true,
        ...(search && { nom: { contains: search, mode: 'insensitive' } }),
      },
      orderBy: { nom: 'asc' },
      select: this.safeSelect,
    });
  }

  async findOne(id: number) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      select: { ...this.safeSelect, adresse: true },
    });
    if (!client) throw new NotFoundException(`Client #${id} introuvable`);
    return client;
  }

  create(dto: CreateClientDto) {
    return this.prisma.client.create({ data: dto });
  }

  findPending() {
    return this.prisma.client.findMany({
      where: { actif: false },
      orderBy: { id: 'desc' },
      select: this.safeSelect,
    });
  }

  findPendingApproval() {
    return this.prisma.client.findMany({
      where: { role: 'PRO', approved: false, actif: true },
      orderBy: { id: 'desc' },
      select: this.safeSelect,
    });
  }

  async register(dto: RegisterClientDto) {
    const isPro = dto.type === 'PHARMACIE' || dto.type === 'PARA';
    const role = isPro ? 'PRO' : 'CLIENT_PUBLIC';
    const actif = !isPro;
    const approved = !isPro;

    const data: any = {
      nom: dto.nom, type: dto.type, email: dto.email,
      ville: dto.ville, telephone: dto.telephone,
      role, actif, approved,
    };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.client.create({
      data,
      select: { id: true, nom: true, email: true, type: true, role: true, approved: true, actif: true },
    });
  }

  pendingCount() {
    return this.prisma.client.count({ where: { actif: false } });
  }

  pendingApprovalCount() {
    return this.prisma.client.count({ where: { role: 'PRO', approved: false, actif: true } });
  }

  async approve(id: number) {
    const client = await this.prisma.client.findFirstOrThrow({ where: { id } });
    const role = ['PHARMACIE', 'PARA'].includes(client.type) ? 'PRO' : 'CLIENT_PUBLIC';
    return this.prisma.client.update({
      where: { id },
      data: { actif: true, approved: true, role },
      select: this.safeSelect,
    });
  }

  async update(id: number, dto: UpdateClientDto) {
    await this.prisma.client.findFirstOrThrow({ where: { id } });
    return this.prisma.client.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.prisma.client.findFirstOrThrow({ where: { id } });
    return this.prisma.client.update({ where: { id }, data: { actif: false } });
  }
}
