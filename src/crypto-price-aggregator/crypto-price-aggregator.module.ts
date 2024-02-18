import { Module } from '@nestjs/common';
import { CryptoPriceAggregatorService } from './crypto-price-aggregator.service';
import { CryptoPriceAggregatorController } from './crypto-price-aggregator.controller';
import { BinanceService } from 'src/binance/binance.service';
import { BybitService } from 'src/bybit/bybit.service';

@Module({
  controllers: [CryptoPriceAggregatorController],
  providers: [CryptoPriceAggregatorService, BinanceService, BybitService],
  exports: [CryptoPriceAggregatorService],
})
export class CryptoPriceAggregatorModule {}
