import { Test, TestingModule } from '@nestjs/testing';
import { TokenInfosService } from './token-infos.service';

describe('TokenInfosService', () => {
  let service: TokenInfosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenInfosService],
    }).compile();

    service = module.get<TokenInfosService>(TokenInfosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
