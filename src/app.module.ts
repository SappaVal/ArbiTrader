import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { Exchange } from './entities/exchange.entity';
import { GlobalParam } from './entities/global-param.entity';
import { UserExchange } from './entities/user-exchange.entity.ts';
import { UserGlobalParam } from './entities/user-global-param.entity';
import { User } from './entities/user.entity';
import { Wallet } from './entities/wallet.entity';
import { ExchangesModule } from './exchanges/exchanges.module';
import { UsersModule } from './users/users.module';
import { GlobalParamsModule } from './global-params/global-params.module';
import { BinanceModule } from './binance/binance.module';
import { HistoricalPrice } from './entities/historical-price.entity';
import { TradingPair } from './entities/trading-pair.entity';
import { BybitModule } from './bybit/bybit.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    ExchangesModule,
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
          HistoricalPrice,
          TradingPair,
        ],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    GlobalParamsModule,
    BinanceModule,
    BybitModule,
  ],
})
export class AppModule {}
