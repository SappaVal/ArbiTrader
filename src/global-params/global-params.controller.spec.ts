import { Test, TestingModule } from '@nestjs/testing';
import { GlobalParamsController } from './global-params.controller';
import { GlobalParamsService } from './global-params.service';

describe('GlobalParamsController', () => {
  let controller: GlobalParamsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GlobalParamsController],
      providers: [GlobalParamsService],
    }).compile();

    controller = module.get<GlobalParamsController>(GlobalParamsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
