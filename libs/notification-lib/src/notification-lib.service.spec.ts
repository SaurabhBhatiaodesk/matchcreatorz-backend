import { Test, TestingModule } from '@nestjs/testing';
import { NotificationLibService } from './notification-lib.service';

describe('NotificationLibService', () => {
  let service: NotificationLibService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationLibService],
    }).compile();

    service = module.get<NotificationLibService>(NotificationLibService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
