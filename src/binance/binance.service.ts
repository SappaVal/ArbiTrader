import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { HistoricalPrice } from 'src/entities/historical-price.entity';
import { DailyPriceResultDto } from 'src/shared/dto/daily-price-result.dto';
import { RemoteExchangeInterface } from 'src/shared/interfaces/remote-exchange.interface';
import { convertToDatabaseInterval } from 'src/shared/utils/interval-converter.util';
import { RequestTradingPairDto } from '../shared/dto/trading-pair.dto';

@Injectable()
export class BinanceService implements RemoteExchangeInterface {
  constructor(private httpService: HttpService) {}

  private readonly baseUrl = 'https://api.binance.com/api/v3';

  public async getTradingPairInfo(): Promise<RequestTradingPairDto[]> {
    const url = `${this.baseUrl}/exchangeInfo`;

    const response = await this.httpService.get(url).toPromise();
    const allSymbols = response.data.symbols;
    const usdtPairs: RequestTradingPairDto[] = allSymbols
      .filter((info) => info.symbol.endsWith('USDT'))
      .map((symbol) => {
        return { pair: symbol.symbol } as RequestTradingPairDto;
      });

    return usdtPairs;
  }

  public async getHistoricalData(
    symbol: string,
    interval: string,
    startTime?: number,
    endTime?: number,
    limit?: number,
  ): Promise<HistoricalPrice[]> {
    const url = `${this.baseUrl}/klines`;
    const params = { symbol, interval, startTime, endTime, limit };

    const response = await lastValueFrom(
      this.httpService
        .get(url, { params })
        .pipe(map((response) => response.data)),
    );

    const historicalDataDtos = response.map((data) => {
      const historicalPrice = new HistoricalPrice();
      historicalPrice.openTime = data[0];
      historicalPrice.open = data[1];
      historicalPrice.high = data[2];
      historicalPrice.low = data[3];
      historicalPrice.close = data[4];
      historicalPrice.volume = data[7];
      historicalPrice.closeTime = data[6];
      historicalPrice.interval = convertToDatabaseInterval(interval);

      return historicalPrice;
    });

    return historicalDataDtos;
  }

  public async getCurrentPrices(
    symbols: string[],
  ): Promise<DailyPriceResultDto[]> {
    const batchSize = 60;
    const symbolBatches = [];

    for (let i = 0; i < symbols.length; i += batchSize) {
      const symbolBatch = symbols.slice(i, i + batchSize);
      symbolBatches.push(symbolBatch);
    }

    const requests = symbolBatches.map(async (symbolBatch) => {
      const formattedSymbols = encodeURIComponent(JSON.stringify(symbolBatch));
      const url = `${this.baseUrl}/ticker/24hr?symbols=${formattedSymbols}&type=MINI`;

      const response = await lastValueFrom(
        this.httpService.get(url).pipe(map((response) => response.data)),
      );

      return response.map(
        (data) =>
          ({
            symbol: data.symbol,
            volume: Number(data.quoteVolume),
            price: Number(data.lastPrice),
          }) as DailyPriceResultDto,
      );
    });

    const results = await Promise.all(requests);
    return [].concat(...results);
  }
}
