import { Controller, Get } from '@nestjs/common';
import { CryptoPriceAggregatorService } from './crypto-price-aggregator.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Crypto Price Aggregator')
@Controller('crypto-price-aggregator')
export class CryptoPriceAggregatorController {
  constructor(
    private readonly cryptoPriceAggregatorService: CryptoPriceAggregatorService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get current price',
    description: 'Get current price',
  })
  async getCurrentPrice() {
    return await this.cryptoPriceAggregatorService.getCurrentPriceFromCache();
  }
}
