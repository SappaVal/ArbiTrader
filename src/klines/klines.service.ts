import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HistoricalPrice } from 'src/entities/historical-price.entity';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { KlineDto } from './dto/kline.dto';

@Injectable()
export class KlinesService {
  constructor(
    @InjectRepository(HistoricalPrice)
    private readonly historicalPriceRepository: Repository<HistoricalPrice>,
    private readonly entityManager: EntityManager,
  ) {}

  async getDailyKlinesBySymbol(symbol: string): Promise<KlineDto[]> {
    return [];
  }

  async getWeeklyKlinesBySymbol(symbol: string): Promise<KlineDto[]> {
    return [];
  }

  async getMonthlyKlinesBySymbol(symbol: string): Promise<KlineDto[]> {
    return [];
  }

  async getYearlyKlinesBySymbol(symbol: string): Promise<KlineDto[]> {
    const query = this.prepareKlinesQuery(symbol).limit(366);

    const result = await query.getRawMany();
    return result.map((r) => KlineDto.fromRawResult(r));
  }

  async getAllKlinesBySymbol(symbol: string): Promise<KlineDto[]> {
    const distinctRows = await this.countDistinctDayKlines(symbol);
    if (distinctRows < 800) {
      return [];
    } else {
      const maxRows = Math.ceil(distinctRows / 400);
      return await this.getDistinctDayKlinesByMaxRows(symbol, maxRows);
    }
  }

  private async countDistinctDayKlines(symbol: string): Promise<number> {
    const query = `
    SELECT COUNT(*) AS count
    FROM (
        SELECT DISTINCT ON (hp."openTime") 
            hp."openTime"
        FROM 
            public.historical_price hp
        INNER JOIN 
            public.trading_pair tp ON hp."tradingPairId" = tp."id"
        WHERE 
            tp."symbol" = '${symbol}USDT'
            AND "interval" = 'D'
        ORDER BY 
            hp."openTime" DESC, hp.volume DESC
    ) as subquery`;

    const result = await this.entityManager.query(query);
    return result[0].count;
  }

  async getDistinctDayKlinesByMaxRows(symbol: string, maxRows: number): Promise<KlineDto[]> {
    const query = this.prepareKlinesQuery(symbol);

    const result = await query.getRawMany();
    const filteredResult = result.filter((_, index) => (index + 1) % maxRows === 0);
    console.log('filteredResult', filteredResult.length);
    return filteredResult.map((r) => KlineDto.fromRawResult(r));
  }

  private prepareKlinesQuery(symbol: string, interval: string = 'D'): SelectQueryBuilder<HistoricalPrice> {
    return this.historicalPriceRepository
      .createQueryBuilder('hp')
      .distinctOn(['hp.openTime'])
      .select([
        'hp.openTime AS openTime',
        'hp.open AS open',
        'hp.high AS high',
        'hp.low AS low',
        'hp.close AS close',
        'hp.volume AS volume',
        'hp.closeTime AS closeTime',
        'hp.interval AS interval',
        'hp.tradingPairId AS tradingPairId',
      ])
      .innerJoin('trading_pair', 'tp', 'hp.tradingPairId = tp.id')
      .where('tp.symbol = :symbol', { symbol: `${symbol}USDT` })
      .andWhere('hp.interval = :interval', { interval })
      .orderBy('hp.openTime', 'DESC')
      .addOrderBy('hp.volume', 'DESC');
  }
}
