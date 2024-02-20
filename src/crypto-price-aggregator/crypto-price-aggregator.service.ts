import { Injectable, Inject } from '@nestjs/common';
import { BinanceService } from 'src/binance/binance.service';
import { BybitService } from 'src/bybit/bybit.service';
import { DailyPriceResultDto } from 'src/shared/dto/daily-price-result.dto';
import { ExchangesService } from './../exchanges/exchanges.service';
import { map } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CryptoPriceAggregatorService {
  constructor(
    private readonly binanceService: BinanceService,
    private readonly bybitService: BybitService,
    private readonly exchangesService: ExchangesService,
  ) {}

  async getCurrentPrice() {
    const symbols = await this.exchangesService.getPairByExchange('binance');
    const binancePrices = await this.binanceService.getCurrentPrices(symbols);
    const bybitPrices = await this.bybitService.getCurrentPrices(
      await this.exchangesService.getPairByExchange('bybit'),
    );

    const weightedAveragePrices = symbols.map((symbol) => {
      const binanceSymbolData = binancePrices.find(
        (data) => data.symbol === symbol,
      );
      const bybitSymbolData = bybitPrices.find(
        (data) => data.symbol === symbol,
      );

      const allSymbolData = [binanceSymbolData, bybitSymbolData].filter(
        Boolean,
      ) as DailyPriceResultDto[];

      return {
        symbol: symbol,
        price: this.calculateWeightedAveragePrice(allSymbolData),
        volume: this.calculateTotalVolume(allSymbolData),
      };
    });

    return weightedAveragePrices;
  }

  private calculateWeightedAveragePrice(
    symbolDataList: DailyPriceResultDto[],
  ): number {
    let totalVolume = 0;
    let totalValue = 0;

    symbolDataList.forEach((symbolData) => {
      const contribution = symbolData.volume * symbolData.price;
      totalVolume += symbolData.volume;
      totalValue += contribution;
    });

    if (totalVolume === 0) {
      return 0;
    }

    const weightedAveragePrice = totalValue / totalVolume;
    return weightedAveragePrice;
  }

  private calculateTotalVolume(symbolDataList: DailyPriceResultDto[]): number {
    let totalVolume = 0;

    symbolDataList.forEach((symbolData) => {
      totalVolume += symbolData.volume;
    });

    return totalVolume;
  }
}
