import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { Exchange } from 'src/entities/exchange.entity';
import { HistoricalPrice } from 'src/entities/historical-price.entity';
import { TradingPair } from 'src/entities/trading-pair.entity';
import { convertToDatabaseInterval } from 'src/shared/utils/interval-converter.util';
import { Repository } from 'typeorm';
import { DailyCronResultDto } from '../shared/dto/daily-cron-result.dto';
import { TradingPairDto } from '../shared/dto/trading-pair.dto';
import { BinanceIntervalEnum } from './enum/binance-interval-enum';
import { RemoteExchangeInterface } from 'src/shared/interfaces/remote-exchange.interface';

@Injectable()
export class BinanceService implements RemoteExchangeInterface {
  constructor(private httpService: HttpService) {}

  private readonly baseUrl = 'https://api.binance.com/api/v3';

  public async getTradingPairInfo(): Promise<TradingPairDto[]> {
    const url = `${this.baseUrl}/exchangeInfo`;

    const response = await this.httpService.get(url).toPromise();
    const allSymbols = response.data.symbols;
    const usdtPairs: TradingPairDto[] = allSymbols
      .filter((info) => info.symbol.endsWith('USDT'))
      .map((symbol) => {
        return { pair: symbol.symbol } as TradingPairDto;
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
}
