import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async login(email: string, password: string) {
    const client = await this.prisma.client.findUnique({ where: { email } });
    if (!client || !client.password) throw new UnauthorizedException('Identifiants invalides');
    if (!client.actif) {
      if (client.role === 'PRO') throw new UnauthorizedException('Votre compte est en attente de validation par un administrateur');
      throw new UnauthorizedException('Compte désactivé');
    }
    if (client.role === 'PRO' && !client.approved) {
      throw new UnauthorizedException('Votre compte est en attente de validation par un administrateur');
    }

    const valid = await bcrypt.compare(password, client.password);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    const token = this.jwt.sign({
      sub: client.id,
      email: client.email,
      nom: client.nom,
      role: client.role,
    });
    return {
      token,
      client: {
        id: client.id,
        nom: client.nom,
        email: client.email,
        type: client.type,
        role: client.role,
        ville: client.ville,
        approved: client.approved,
      },
    };
  }

  async adminLogin(username: string, password: string) {
    // Check DB-backed admin first (by email)
    const admin = await this.prisma.client.findFirst({ where: { role: 'ADMIN', email: username } });
    if (admin && admin.password) {
      const valid = await bcrypt.compare(password, admin.password);
      if (valid) {
        const token = this.jwt.sign({ sub: admin.id, email: admin.email, nom: admin.nom, role: 'ADMIN' });
        return { token };
      }
    }
    // Fallback to env-based admin
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin';
    if (username !== adminUser || password !== adminPass) throw new UnauthorizedException('Identifiants invalides');
    const token = this.jwt.sign({ sub: 'admin', role: 'ADMIN', nom: 'Admin', email: username });
    return { token };
  }

  async setPassword(clientId: number, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    return this.prisma.client.update({ where: { id: clientId }, data: { password: hashed } });
  }

  async me(userId: any) {
    if (userId === 'admin') return { id: 'admin', nom: 'Admin', role: 'ADMIN' };
    const client = await this.prisma.client.findUnique({ where: { id: Number(userId) } });
    if (!client) throw new UnauthorizedException();
    const { password: _, ...rest } = client;
    return rest;
  }
}
