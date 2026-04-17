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

  validate(payload: { sub: number; email: string; nom: string }) {
    return { id: payload.sub, email: payload.email, nom: payload.nom };
  }
}
