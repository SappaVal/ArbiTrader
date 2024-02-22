import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TokenInfosService } from './token-infos.service';
import { CreateTokenInfoDto } from './dto/create-token-info.dto';
import { UpdateTokenInfoDto } from './dto/update-token-info.dto';

@Controller('token-infos')
export class TokenInfosController {
  constructor(private readonly tokenInfosService: TokenInfosService) {}

  @Post()
  create(@Body() createTokenInfoDto: CreateTokenInfoDto) {
    return this.tokenInfosService.create(createTokenInfoDto);
  }

  @Get()
  findAll() {
    return this.tokenInfosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tokenInfosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTokenInfoDto: UpdateTokenInfoDto) {
    return this.tokenInfosService.update(+id, updateTokenInfoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tokenInfosService.remove(+id);
  }
}
