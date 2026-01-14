import { Test, TestingModule } from '@nestjs/testing';
import { ChatLibService } from './chat-lib.service';

describe('ServiceLibService', () => {
  let service: ChatLibService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatLibService],
    }).compile();

    service = module.get<ChatLibService>(ChatLibService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
