import { Test, TestingModule } from '@nestjs/testing';
import { SellerLibService } from './seller-lib.service';

describe('UserLibService', () => {
  let service: SellerLibService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SellerLibService],
    }).compile();

    service = module.get<SellerLibService>(SellerLibService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
