import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exchange } from 'src/entities/exchange.entity';
import { ExchangesController } from './exchanges.controller';
import { ExchangesService } from './exchanges.service';

@Module({
  imports: [TypeOrmModule.forFeature([Exchange])],
  controllers: [ExchangesController],
  providers: [ExchangesService],
})
export class ExchangesModule {}
