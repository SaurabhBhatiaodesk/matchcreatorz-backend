import { Test, TestingModule } from '@nestjs/testing';
import { TagLibService } from './tag-lib.service';

describe('TagLibService', () => {
  let service: TagLibService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TagLibService],
    }).compile();

    service = module.get<TagLibService>(TagLibService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
