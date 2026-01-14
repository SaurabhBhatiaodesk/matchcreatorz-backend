import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageController } from './page.controller';
import { Page } from 'common/models';
import { PageLibService } from '@app/page-lib';

@Module({
  imports: [TypeOrmModule.forFeature([Page])],
  controllers: [PageController],
  providers: [PageLibService],
})
export class PageModule {}
