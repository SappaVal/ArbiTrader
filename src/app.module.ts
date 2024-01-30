import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Exchange } from './entities/exchange.entity';
import { UserExchange } from './entities/user-exchange.entity.ts';
import { GlobalParam } from './entities/global-param.entity';
import { UserGlobalParam } from './entities/user-global-param.entity';
import { Wallet } from './entities/wallet.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<any>('DATABASE_TYPE'),
        host: configService.get<string>('POSTGRES_HOST'),
        port: parseInt(configService.get<string>('POSTGRES_PORT')),
        username: configService.get<string>('POSTGRES_USERNAME'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DATABASE'),
        entities: [
          User,
          Exchange,
          UserExchange,
          GlobalParam,
          UserGlobalParam,
          Wallet,
        ],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
})
export class AppModule {}
