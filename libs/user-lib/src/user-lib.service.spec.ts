import { Test, TestingModule } from '@nestjs/testing';
import { UserLibService } from './user-lib.service';

describe('UserLibService', () => {
  let service: UserLibService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserLibService],
    }).compile();

    service = module.get<UserLibService>(UserLibService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
