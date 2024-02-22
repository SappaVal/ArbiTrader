import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Cron } from '@nestjs/schedule';
import { DailyPriceResultDto } from 'src/shared/dto/daily-price-result.dto';
import { BinanceService } from 'src/binance/binance.service';
import { BybitService } from 'src/bybit/bybit.service';
import { ExchangesService } from 'src/exchanges/exchanges.service';

@Injectable()
export class CurrentPriceCronService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly binanceService: BinanceService,
    private readonly bybitService: BybitService,
    private readonly exchangesService: ExchangesService,
  ) {}

  public async updateCurrentPriceCache() {
    const symbolsBinance =
      await this.exchangesService.getPairByExchange('binance');
    const binancePrices =
      await this.binanceService.getCurrentPrices(symbolsBinance);

    const symbolsBybit = await this.exchangesService.getPairByExchange('bybit');
    const bybitPrices = await this.bybitService.getCurrentPrices(symbolsBybit);

    const uniqueSymbols = new Set([...symbolsBinance, ...symbolsBybit]);
    const weightedAveragePrices = Array.from(uniqueSymbols).map((symbol) => {
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

    await this.cacheManager.set('cryptoPrices', weightedAveragePrices, 30000);
  }

  @Cron('*/30 * * * * *')
  async handleCron() {
    console.log('Updating crypto prices');
    await this.updateCurrentPriceCache();
    console.log('Crypto prices updated');
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
