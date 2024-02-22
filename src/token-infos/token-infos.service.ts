import { Injectable } from '@nestjs/common';
import { CreateTokenInfoDto } from './dto/create-token-info.dto';
import { UpdateTokenInfoDto } from './dto/update-token-info.dto';

@Injectable()
export class TokenInfosService {
  create(createTokenInfoDto: CreateTokenInfoDto) {
    return 'This action adds a new tokenInfo';
  }

  findAll() {
    return `This action returns all tokenInfos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tokenInfo`;
  }

  update(id: number, updateTokenInfoDto: UpdateTokenInfoDto) {
    return `This action updates a #${id} tokenInfo`;
  }

  remove(id: number) {
    return `This action removes a #${id} tokenInfo`;
  }
}
