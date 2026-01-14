import { Test, TestingModule } from '@nestjs/testing';
import { JobLibService } from './job-lib.service';

describe('JobLibService', () => {
  let service: JobLibService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobLibService],
    }).compile();

    service = module.get<JobLibService>(JobLibService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
