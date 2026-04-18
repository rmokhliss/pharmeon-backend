import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'pharmeon-secret-key',
    });
  }

  validate(payload: { sub: number | string; email: string; nom: string; role: string }) {
    if (payload.sub === 'admin' || payload.role === 'ADMIN') {
      return { id: payload.sub, email: payload.email || null, nom: payload.nom || 'Admin', role: 'ADMIN' };
    }
    return { id: payload.sub, email: payload.email, nom: payload.nom, role: payload.role || 'CLIENT_PUBLIC' };
  }
}
