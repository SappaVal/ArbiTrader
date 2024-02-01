import { Test, TestingModule } from '@nestjs/testing';
import { GlobalParamsService } from './global-params.service';

describe('GlobalParamsService', () => {
  let service: GlobalParamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlobalParamsService],
    }).compile();

    service = module.get<GlobalParamsService>(GlobalParamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
