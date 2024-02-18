import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { HistoricalPrice } from 'src/entities/historical-price.entity';
import { TradingPairDto } from 'src/shared/dto/trading-pair.dto';
import { RemoteExchangeInterface } from 'src/shared/interfaces/remote-exchange.interface';
import { convertToDatabaseInterval } from 'src/shared/utils/interval-converter.util';
@Injectable()
export class BybitService implements RemoteExchangeInterface {
  constructor(private httpService: HttpService) {}

  private readonly baseUrl = 'https://api.bybit.com/v5/market';

  public async getTradingPairInfo(): Promise<TradingPairDto[]> {
    const url = `${this.baseUrl}/instruments-info?category=spot`;
    const response = await lastValueFrom(
      this.httpService.get(url).pipe(map((response) => response.data)),
    );

    const usdtPairs: TradingPairDto[] = response.result.list
      .filter(
        (info) => info.status === 'Trading' && info.symbol.endsWith('USDT'),
      )
      .map((info) => {
        return { pair: info.symbol } as TradingPairDto;
      });
    return usdtPairs;
  }

  public async getHistoricalData(
    symbol: string,
    interval: string,
    start?: number,
    end?: number,
    limit?: number,
  ): Promise<HistoricalPrice[]> {
    const category = 'spot';
    const url = `${this.baseUrl}/kline`;
    const params = { category, symbol, interval, start, end, limit };
    var millisecondsInADay = 24 * 60 * 60 * 1000 - 1;
    const response = await lastValueFrom(
      this.httpService
        .get(url, { params })
        .pipe(map((response) => response.data)),
    );
    return response.result.list.reverse().map((data) => {
      const historicalPrice = new HistoricalPrice();
      historicalPrice.interval = convertToDatabaseInterval(interval);
      historicalPrice.openTime = parseInt(data[0]);
      historicalPrice.open = data[1];
      historicalPrice.high = data[2];
      historicalPrice.low = data[3];
      historicalPrice.close = data[4];
      historicalPrice.volume = data[5];
      historicalPrice.closeTime = (parseInt(data[0]) +
        millisecondsInADay) as number;
      return historicalPrice;
    });
  }
}
