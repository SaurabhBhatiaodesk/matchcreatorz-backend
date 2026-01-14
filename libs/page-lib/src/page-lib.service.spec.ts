import { Test, TestingModule } from '@nestjs/testing';
import { PageLibService } from './page-lib.service';

describe('PageLibService', () => {
  let service: PageLibService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PageLibService],
    }).compile();

    service = module.get<PageLibService>(PageLibService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
