import { Test, TestingModule } from '@nestjs/testing';
import { BookingsLibService } from './booking-lib.service';

describe('BookingsLibService', () => {
  let service: BookingsLibService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingsLibService],
    }).compile();

    service = module.get<BookingsLibService>(BookingsLibService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
