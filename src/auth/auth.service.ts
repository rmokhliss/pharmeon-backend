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
    if (!client.actif) throw new UnauthorizedException('Compte désactivé');

    const valid = await bcrypt.compare(password, client.password);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    const token = this.jwt.sign({ sub: client.id, email: client.email, nom: client.nom });
    return { token, client: { id: client.id, nom: client.nom, email: client.email, type: client.type, ville: client.ville } };
  }

  async setPassword(clientId: number, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    return this.prisma.client.update({ where: { id: clientId }, data: { password: hashed } });
  }
}
