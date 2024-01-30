import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UnauthorizedException } from '@nestjs/common';
import { UserPayload } from '../dto/user-payload';

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(userPayload: UserPayload) {
    if (userPayload.role === 'ADMIN') {
      return userPayload;
    } else {
      throw new UnauthorizedException(
        'Accès non autorisé. Réservé aux administrateurs.',
      );
    }
  }
}
