import { Test, TestingModule } from '@nestjs/testing';
import { AdminSettingLibService } from './admin-setting-lib.service';

describe('AdminSettingLibService', () => {
  let service: AdminSettingLibService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminSettingLibService],
    }).compile();

    service = module.get<AdminSettingLibService>(AdminSettingLibService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
