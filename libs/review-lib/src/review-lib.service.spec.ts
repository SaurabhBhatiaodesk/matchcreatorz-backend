import { Test, TestingModule } from '@nestjs/testing';
import { ReviewLibService } from './review-lib.service';

describe('ReviewLibService', () => {
  let service: ReviewLibService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewLibService],
    }).compile();

    service = module.get<ReviewLibService>(ReviewLibService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
