import { Test, TestingModule } from '@nestjs/testing';
import { ResourceLibService } from './resource-lib.service';

describe('ResourceLibService', () => {
  let service: ResourceLibService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResourceLibService],
    }).compile();

    service = module.get<ResourceLibService>(ResourceLibService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
