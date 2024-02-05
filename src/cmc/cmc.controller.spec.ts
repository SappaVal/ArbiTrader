import { Test, TestingModule } from '@nestjs/testing';
import { CmcController } from './cmc.controller';
import { CmcService } from './cmc.service';

describe('CmcController', () => {
  let controller: CmcController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CmcController],
      providers: [CmcService],
    }).compile();

    controller = module.get<CmcController>(CmcController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
