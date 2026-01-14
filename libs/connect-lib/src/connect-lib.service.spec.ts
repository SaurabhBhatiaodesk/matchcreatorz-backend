import { Test, TestingModule } from '@nestjs/testing';
import { ConnectLibService } from './connect-lib.service';

describe('ConnectLibService', () => {
  let service: ConnectLibService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConnectLibService],
    }).compile();

    service = module.get<ConnectLibService>(ConnectLibService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
