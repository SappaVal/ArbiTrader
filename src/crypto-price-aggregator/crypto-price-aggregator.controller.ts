import { Controller, Get } from '@nestjs/common';
import { CryptoPriceAggregatorService } from './crypto-price-aggregator.service';

@Controller('crypto-price-aggregator')
export class CryptoPriceAggregatorController {
  constructor(
    private readonly cryptoPriceAggregatorService: CryptoPriceAggregatorService,
  ) {}

  @Get()
  async getCurrentPrice() {
    return await this.cryptoPriceAggregatorService.getCurrentPrice();
  }
}
