import { Test, TestingModule } from '@nestjs/testing';
import { BuyerLibService } from './buyer-lib.service';

describe('UserLibService', () => {
  let service: BuyerLibService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuyerLibService],
    }).compile();

    service = module.get<BuyerLibService>(BuyerLibService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
