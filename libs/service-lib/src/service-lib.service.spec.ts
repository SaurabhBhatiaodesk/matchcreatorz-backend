import { Test, TestingModule } from '@nestjs/testing';
import { ServiceLibService } from './service-lib.service';

describe('ServiceLibService', () => {
  let service: ServiceLibService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceLibService],
    }).compile();

    service = module.get<ServiceLibService>(ServiceLibService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
