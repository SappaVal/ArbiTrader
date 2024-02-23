import { Module, Inject } from '@nestjs/common';
import { TokenInfosService } from './token-infos.service';
import { TokenInfosController } from './token-infos.controller';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [HttpModule],
  controllers: [TokenInfosController],
  providers: [TokenInfosService],
})
export class TokenInfosModule {}
