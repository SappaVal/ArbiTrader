import { Injectable } from '@nestjs/common';
import { BinanceService } from 'src/binance/binance.service';
import { BybitService } from 'src/bybit/bybit.service';

@Injectable()
export class CryptoPriceAggregatorService {
  constructor(
    private readonly binanceService: BinanceService,
    private readonly bybitService: BybitService,
  ) {}

  async getCurrentPrice() {
    const binancePrice = await this.binanceService.getCurrentPrice('BTCUSDT');
    const bybitPrice = await this.bybitService.getCurrentPrice('BTCUSDT');
    return {
      binance: binancePrice,
      bybit: bybitPrice,
    };
  }
}
