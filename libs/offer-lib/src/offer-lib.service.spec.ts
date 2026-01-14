import { Test, TestingModule } from '@nestjs/testing';
import { OfferLibService } from './offer-lib.service';

describe('OfferLibService', () => {
  let service: OfferLibService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OfferLibService],
    }).compile();

    service = module.get<OfferLibService>(OfferLibService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
