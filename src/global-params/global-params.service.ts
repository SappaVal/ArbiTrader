import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GlobalParam } from 'src/entities/global-param.entity';
import { Repository } from 'typeorm';
import { UpdateGlobalParamDto } from './dto/update-global-param.dto';

@Injectable()
export class GlobalParamsService {
  constructor(
    @InjectRepository(GlobalParam)
    private globalParamRepository: Repository<GlobalParam>,
  ) {}

  /*async create(
    createGlobalParamDto: CreateGlobalParamDto,
  ): Promise<GlobalParam> {
    const existingGlobalParam = await this.globalParamRepository.findOne({
      where: [{ key: createGlobalParamDto.key }],
    });

    if (existingGlobalParam) {
      throw new ConflictException('GlobalParam already exists');
    }

    const newGlobalParam =
      this.globalParamRepository.create(createGlobalParamDto);
    return await this.globalParamRepository.save(newGlobalParam);
  }*/

  async findAll(): Promise<GlobalParam[]> {
    return await this.globalParamRepository.find();
  }

  async findOne(id: number): Promise<GlobalParam> {
    const globalParam = await this.globalParamRepository.findOne({
      where: { id },
    });

    if (!globalParam) {
      throw new NotFoundException(`GlobalParam with id ${id} not found`);
    }

    return globalParam;
  }

  async update(
    id: number,
    updateGlobalParamDto: UpdateGlobalParamDto,
  ): Promise<GlobalParam> {
    const globalParam = await this.findOne(id);
    await this.globalParamRepository.update(id, updateGlobalParamDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<GlobalParam> {
    const removedGlobalParam = await this.findOne(id);
    await this.globalParamRepository.delete(id);
    return removedGlobalParam;
  }
}
