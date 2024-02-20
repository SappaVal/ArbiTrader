import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { BinanceService } from 'src/binance/binance.service';
import { BybitService } from 'src/bybit/bybit.service';
import { ExchangesService } from 'src/exchanges/exchanges.service';
import { CryptoPriceAggregatorController } from './crypto-price-aggregator.controller';
import { CryptoPriceAggregatorService } from './crypto-price-aggregator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exchange } from 'src/entities/exchange.entity';
import { ExchangesModule } from 'src/exchanges/exchanges.module';
@Module({
  imports: [HttpModule, ExchangesModule],
  controllers: [CryptoPriceAggregatorController],
  providers: [CryptoPriceAggregatorService, BinanceService, BybitService],
  exports: [CryptoPriceAggregatorService],
})
export class CryptoPriceAggregatorModule {}
