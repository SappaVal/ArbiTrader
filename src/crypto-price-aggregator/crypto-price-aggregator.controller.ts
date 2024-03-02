import { Controller, Get } from '@nestjs/common'
import { CryptoPriceAggregatorService } from './crypto-price-aggregator.service'
import { ApiTags, ApiOperation } from '@nestjs/swagger'

@ApiTags('Price')
@Controller('price')
export class CryptoPriceAggregatorController {
  constructor(private readonly cryptoPriceAggregatorService: CryptoPriceAggregatorService) {}

  @Get()
  @ApiOperation({ summary: 'Get all current price', description: 'Get all current price from all pairs' })
  async getCurrentPrice() {
    return await this.cryptoPriceAggregatorService.getCurrentPriceFromCache()
  }
}
