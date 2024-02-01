import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exchange } from 'src/entities/exchange.entity';
import { UserExchange } from 'src/entities/user-exchange.entity.ts';
import { User } from 'src/entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ExchangesService } from 'src/exchanges/exchanges.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, Exchange, UserExchange])],
  controllers: [UsersController],
  providers: [UsersService, ExchangesService],
})
export class UsersModule {}
