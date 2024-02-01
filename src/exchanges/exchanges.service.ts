import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exchange } from 'src/entities/exchange.entity';
import { Repository } from 'typeorm';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { UpdateExchangeDto } from './dto/update-exchange.dto';

@Injectable()
export class ExchangesService {
  constructor(
    @InjectRepository(Exchange)
    private exchangeRepository: Repository<Exchange>,
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

  async remove(id: number): Promise<Exchange> {
    const removedExchange = await this.findOne(id);
    await this.exchangeRepository.delete(id);
    return removedExchange;
  }
}
