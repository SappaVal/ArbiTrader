import { Module } from '@nestjs/common';
import { GlobalParamsService } from './global-params.service';
import { GlobalParamsController } from './global-params.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalParam } from 'src/entities/global-param.entity';
@Module({
  imports: [TypeOrmModule.forFeature([GlobalParam])],
  controllers: [GlobalParamsController],
  providers: [GlobalParamsService],
  exports: [GlobalParamsService],
})
export class GlobalParamsModule {}
