import { Module } from '@nestjs/common';
import { UtilController } from './util.controller';
import { UtilLibService } from '@app/util-lib';

@Module({
  imports: [],
  controllers: [UtilController],
  providers: [UtilLibService],
})
export class UtilModule {}
