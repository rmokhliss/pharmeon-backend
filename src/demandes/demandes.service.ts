import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export class CreateDemandeDto {
  categorie: string;
  nom: string;
  type?: string;
  ville?: string;
  code_postal?: string;
  adresse?: string;
  telephone?: string;
  email: string;
  contact?: string;
  ice?: string;
  patente?: string;
  rc?: string;
  site_web?: string;
  message?: string;
}

@Injectable()
export class DemandesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateDemandeDto) {
    return this.prisma.demandeAcces.create({ data: dto });
  }

  findAll(statut?: string) {
    return this.prisma.demandeAcces.findMany({
      where: statut ? { statut } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  pendingCount() {
    return this.prisma.demandeAcces.count({ where: { statut: 'EN_ATTENTE' } });
  }

  async approve(id: number) {
    const demande = await this.prisma.demandeAcces.findUnique({ where: { id } });
    if (!demande) throw new NotFoundException(`Demande #${id} introuvable`);

    if (demande.categorie === 'FOURNISSEUR') {
      await this.prisma.fournisseur.create({
        data: {
          nom: demande.nom,
          contact: demande.contact || undefined,
          telephone: demande.telephone || undefined,
          email: demande.email || undefined,
          ville: demande.ville || undefined,
          code_postal: demande.code_postal || undefined,
          adresse: demande.adresse || undefined,
          ice: demande.ice || undefined,
          patente: demande.patente || undefined,
          rc: demande.rc || undefined,
          site_web: demande.site_web || undefined,
          actif: true,
        },
      });
    } else {
      const role = demande.categorie === 'PRO' ? 'PRO' : 'CLIENT_PUBLIC';
      await this.prisma.client.create({
        data: {
          nom: demande.nom,
          type: demande.type || (role === 'PRO' ? 'PHARMACIE' : 'PARTICULIER'),
          email: demande.email,
          ville: demande.ville || undefined,
          code_postal: demande.code_postal || undefined,
          adresse: demande.adresse || undefined,
          telephone: demande.telephone || undefined,
          contact_nom: demande.contact || undefined,
          ice: demande.ice || undefined,
          patente: demande.patente || undefined,
          rc: demande.rc || undefined,
          site_web: demande.site_web || undefined,
          role,
          approved: true,
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
