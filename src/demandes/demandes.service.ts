import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export class CreateDemandeDto {
  categorie: string;
  nom: string;
  type?: string;
  ville?: string;
  telephone?: string;
  email: string;
  contact?: string;
  message?: string;
}

@Injectable()
export class DemandesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateDemandeDto) {
    return this.prisma.demandeAcces.create({ data: dto });
  }

  findAll() {
    return this.prisma.demandeAcces.findMany({
      where: { statut: 'EN_ATTENTE' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(id: number) {
    const demande = await this.prisma.demandeAcces.findUnique({ where: { id } });
    if (!demande) throw new NotFoundException(`Demande #${id} introuvable`);

    if (demande.categorie === 'CLIENT') {
      await this.prisma.client.create({
        data: {
          nom: demande.nom,
          type: demande.type || 'PHARMACIE',
          email: demande.email,
          ville: demande.ville || undefined,
          telephone: demande.telephone || undefined,
          actif: true,
        },
      });
    } else {
      await this.prisma.fournisseur.create({
        data: {
          nom: demande.nom,
          contact: demande.contact || undefined,
          telephone: demande.telephone || undefined,
          ville: demande.ville || undefined,
          actif: true,
        },
      });
    }

    return this.prisma.demandeAcces.update({ where: { id }, data: { statut: 'APPROUVEE' } });
  }

  async reject(id: number) {
    const demande = await this.prisma.demandeAcces.findUnique({ where: { id } });
    if (!demande) throw new NotFoundException(`Demande #${id} introuvable`);
    return this.prisma.demandeAcces.update({ where: { id }, data: { statut: 'REJETEE' } });
  }
}
