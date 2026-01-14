import { Test, TestingModule } from '@nestjs/testing';
import { CategoryLibService } from './category-lib.service';

describe('UserLibService', () => {
  let service: CategoryLibService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryLibService],
    }).compile();

    service = module.get<CategoryLibService>(CategoryLibService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
