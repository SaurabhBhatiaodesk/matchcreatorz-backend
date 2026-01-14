import * as cron from 'node-cron';
import { JobLibService } from '@app/job-lib';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomHeaders } from 'common/decorators';

@ApiTags('Util')
@Controller('utils')
@CustomHeaders()
export class CronController {
  constructor(private readonly jobLibService: JobLibService) {
    this.scheduleSettlementJob();
  }

  scheduleSettlementJob() {
    // For completed Job Settle cron job ...
    cron.schedule('0 */4 * * *', async () => {  // Runs every 4 hours
      await this.jobLibService.completedBookingSettlement();
    });

    // For cancelled Job settle cron job...
    cron.schedule('0 */5 * * *', async () => {  // Runs every 5 hours
      await this.jobLibService.cancelledBookingSettlement();
    });

     // For Auto Accept cancelled Job request cron job...
     cron.schedule('0 */3 * * *', async () => {  // Runs every 3 hours
      await this.jobLibService.autoAcceptedCancelledBooking();
    });

  }

 
}
