import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { BinanceService } from 'src/binance/binance.service';
import { BybitService } from 'src/bybit/bybit.service';
import { ExchangesModule } from 'src/exchanges/exchanges.module';
import { CryptoPriceAggregatorController } from './crypto-price-aggregator.controller';
import { CryptoPriceAggregatorService } from './crypto-price-aggregator.service';
import { CurrentPriceCronService } from './cron/current-price.cron';
@Module({
  imports: [HttpModule, ExchangesModule, CacheModule.register()],
  controllers: [CryptoPriceAggregatorController],
  providers: [
    CryptoPriceAggregatorService,
    BinanceService,
    BybitService,
    CurrentPriceCronService,
  ],
  exports: [CryptoPriceAggregatorService],
})
export class CryptoPriceAggregatorModule {}
