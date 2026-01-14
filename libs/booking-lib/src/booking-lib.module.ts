import { Module } from '@nestjs/common';
import { BookingsLibService } from './booking-lib.service';

@Module({
  providers: [BookingsLibService],
  exports: [BookingsLibService],
})
export class BookingLibModule {}
