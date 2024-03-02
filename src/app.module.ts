import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BinanceModule } from './binance/binance.module';
import { BybitModule } from './bybit/bybit.module';
import { CryptoPriceAggregatorModule } from './crypto-price-aggregator/crypto-price-aggregator.module';
import { Exchange } from './entities/exchange.entity';
import { HistoricalPrice } from './entities/historical-price.entity';
import { TokenInfos } from './entities/token.entity';
import { TradingPair } from './entities/trading-pair.entity';
import { User } from './entities/user.entity';
import { ExchangesModule } from './exchanges/exchanges.module';
import { TokenInfosModule } from './token-infos/token-infos.module';
import { Blockchain } from './entities/blockchain.entity';
import { TokenBlockchain } from './entities/token-blockchain.entity';
import { KlinesModule } from './klines/klines.module';

@Module({
  imports: [
    ExchangesModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
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
        entities: [User, Exchange, HistoricalPrice, TradingPair, TokenInfos, Blockchain, TokenBlockchain],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    BinanceModule,
    BybitModule,
    CryptoPriceAggregatorModule,
    TokenInfosModule,
    KlinesModule,
  ],
})
export class AppModule {}
