import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exchange } from 'src/entities/exchange.entity';
import { UserExchange } from 'src/entities/user-exchange.entity.ts';
import { User } from 'src/entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserGlobalParam } from 'src/entities/user-global-param.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Exchange, UserExchange, UserGlobalParam]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
