import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateTokenInfoDto } from './dto/create-token-info.dto';
import { UpdateTokenInfoDto } from './dto/update-token-info.dto';
import { TokenInfosService } from './token-infos.service';

@ApiTags('Token Infos')
@Controller('token-infos')
export class TokenInfosController {
  constructor(private readonly tokenInfosService: TokenInfosService) {}

  @ApiOperation({
    summary: 'Add an ERC20 or BEP20 token',
    description:
      'Add an ERC20 or BEP20 token using its contract address to the database. Token information is retrieved from Etherscan or BscScan, including the name, symbol, maxSupply, and totalSupply. This token will be subsequently searched for in available exchanges through the API.',
  })
  @Post()
  addEthOrBscToken(@Body() createTokenInfoDto: CreateTokenInfoDto) {
    return this.tokenInfosService.createEthOrBscToken(createTokenInfoDto);
  }

  @ApiOperation({
    summary: 'Get all token info',
    description: 'Get all token info',
  })
  @Get()
  findAll() {
    return this.tokenInfosService.findAll();
  }

  @ApiOperation({
    summary: 'Get token info by id',
    description: 'Get token info by id',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tokenInfosService.findOne(+id);
  }

  @ApiOperation({
    summary: 'Update token info',
    description: 'Update token info',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTokenInfoDto: UpdateTokenInfoDto,
  ) {
    return this.tokenInfosService.update(+id, updateTokenInfoDto);
  }

  @ApiOperation({
    summary: 'Remove token info',
    description: 'Remove token info',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tokenInfosService.remove(+id);
  }
}
