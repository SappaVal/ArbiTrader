import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exchange } from 'src/entities/exchange.entity';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { UpdateExchangeDto } from './dto/update-exchange.dto';
import { HistoricalPrice } from 'src/entities/historical-price.entity';

@Injectable()
export class ExchangesService {
  constructor(
    @InjectRepository(Exchange)
    private exchangeRepository: Repository<Exchange>,
    @InjectRepository(HistoricalPrice)
    private historicalPriceRepository: Repository<HistoricalPrice>,
  ) {}

  async findAll(): Promise<Exchange[]> {
    return await this.exchangeRepository.find();
  }

  async findOne(id: number): Promise<Exchange> {
    const exchange = await this.exchangeRepository.findOne({ where: { id } });

    if (!exchange) {
      throw new NotFoundException(`Exchange with id ${id} not found`);
    }

    return exchange;
  }

  async create(createExchangeDto: CreateExchangeDto): Promise<Exchange> {
    const existingExchange = await this.exchangeRepository.findOne({
      where: [{ name: createExchangeDto.name }],
    });

    if (existingExchange) {
      throw new ConflictException('Exchange already exists');
    }

    const newExchange = this.exchangeRepository.create(createExchangeDto);
    return await this.exchangeRepository.save(newExchange);
  }

  async update(
    id: number,
    updateExchangeDto: UpdateExchangeDto,
  ): Promise<Exchange> {
    const exchange = await this.findOne(id);
    await this.exchangeRepository.update(id, updateExchangeDto);
    return await this.findOne(id);
  }

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
}
