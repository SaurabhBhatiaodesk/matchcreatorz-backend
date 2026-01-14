import { Test, TestingModule } from '@nestjs/testing';
import { WalletLibService } from './wallet-lib.service';

describe('WalletLibService', () => {
  let service: WalletLibService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletLibService],
    }).compile();

    service = module.get<WalletLibService>(WalletLibService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
