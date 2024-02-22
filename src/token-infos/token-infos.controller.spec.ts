import { Test, TestingModule } from '@nestjs/testing';
import { TokenInfosController } from './token-infos.controller';
import { TokenInfosService } from './token-infos.service';

describe('TokenInfosController', () => {
  let controller: TokenInfosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenInfosController],
      providers: [TokenInfosService],
    }).compile();

    controller = module.get<TokenInfosController>(TokenInfosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
