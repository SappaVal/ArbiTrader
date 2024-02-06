import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CmcService } from './cmc.service';

@Controller('cmc')
export class CmcController {
  constructor(private readonly cmcService: CmcService) {}

  @Get(':symbol')
  getCryptoInfo(@Param('symbol') symbol: string) {
    return this.cmcService.getCryptoInfo(symbol);
  }
}
