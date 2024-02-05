import { Injectable } from '@nestjs/common';
import { CreateCmcDto } from './dto/create-cmc.dto';
import { UpdateCmcDto } from './dto/update-cmc.dto';

@Injectable()
export class CmcService {
  create(createCmcDto: CreateCmcDto) {
    return 'This action adds a new cmc';
  }

  findAll() {
    return `This action returns all cmc`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cmc`;
  }

  update(id: number, updateCmcDto: UpdateCmcDto) {
    return `This action updates a #${id} cmc`;
  }

  remove(id: number) {
    return `This action removes a #${id} cmc`;
  }
}
