import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSetting, PriceRange, ResponseTime } from 'common/models';
import { SettingController } from './setting.controller';
import { AdminSettingLibService } from '@app/admin-setting-lib';

@Module({
  imports: [TypeOrmModule.forFeature([AdminSetting,ResponseTime, PriceRange ])],
  controllers: [SettingController],
  providers: [AdminSettingLibService],
})
export class SettingModule {}
