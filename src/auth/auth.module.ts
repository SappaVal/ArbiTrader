import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminStrategy } from './strategies/admin-strategy';
import { JwtStrategy } from './strategies/jwt-strategy';
import { LocalStrategy } from './strategies/local-strategy';
import { RefreshJwtStrategy } from './strategies/refreshToken-strategy';
import { UserExchange } from 'src/entities/user-exchange.entity.ts';

@Module({
  providers: [
    AuthService,
    UsersService,
    LocalStrategy,
    JwtStrategy,
    AdminStrategy,
    RefreshJwtStrategy,
  ],
  controllers: [AuthController],
  imports: [
    TypeOrmModule.forFeature([User, UserExchange]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME'),
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
})
export class AuthModule {}
