import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exchange } from 'src/entities/exchange.entity';
import { HistoricalPrice } from 'src/entities/historical-price.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class ExchangesService {
  constructor(
    @InjectRepository(Exchange)
    private exchangeRepository: Repository<Exchange>,
    @InjectRepository(HistoricalPrice)
    private historicalPriceRepository: Repository<HistoricalPrice>,
  ) {}

  async getHistoricalData(
    exchangeName: string,
    symbol: string,
    interval: string,
    startTime?: number,
    endTime?: number,
    limit?: number,
  ): Promise<HistoricalPrice[]> {
    const whereConditions = {
      tradingPair: { symbol, exchange: { name: exchangeName } },
      interval,
    };

    if (startTime !== undefined) {
      whereConditions['openTime'] = MoreThanOrEqual(startTime);
    }
    if (endTime !== undefined) {
      whereConditions['closeTime'] = LessThanOrEqual(endTime);
    }
    const queryOptions: any = {
      where: whereConditions,
      order: { openTime: 'DESC' },
    };

    if (limit !== undefined) {
      queryOptions.take = limit;
    }

    const historicalDatas =
      await this.historicalPriceRepository.find(queryOptions);

    return historicalDatas;
  }

  async getPairByExchange(exchangeName: string): Promise<string[]> {
    const exchange = await this.exchangeRepository.findOne({
      where: { name: exchangeName.toLowerCase() },
      relations: ['tradingPair'],
    });
    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    return exchange.tradingPair.map((pair) => pair.symbol);
  }
}
