import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CmcService } from './cmc.service';
import { CreateCmcDto } from './dto/create-cmc.dto';
import { UpdateCmcDto } from './dto/update-cmc.dto';

@Controller('cmc')
export class CmcController {
  constructor(private readonly cmcService: CmcService) {}

  @Post()
  create(@Body() createCmcDto: CreateCmcDto) {
    return this.cmcService.create(createCmcDto);
  }

  @Get()
  findAll() {
    return this.cmcService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cmcService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCmcDto: UpdateCmcDto) {
    return this.cmcService.update(+id, updateCmcDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cmcService.remove(+id);
  }
}
