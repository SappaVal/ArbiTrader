import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { UpdateGlobalParamDto } from './dto/update-global-param.dto';
import { GlobalParamsService } from './global-params.service';

@Controller('global-params')
export class GlobalParamsController {
  constructor(private readonly globalParamsService: GlobalParamsService) {}

  /*@Post()
  create(@Body() createGlobalParamDto: CreateGlobalParamDto) {
    return this.globalParamsService.create(createGlobalParamDto);
  }*/

  @Get()
  findAll() {
    return this.globalParamsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.globalParamsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGlobalParamDto: UpdateGlobalParamDto,
  ) {
    return this.globalParamsService.update(id, updateGlobalParamDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.globalParamsService.remove(id);
  }
}
