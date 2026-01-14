import { ResourceLibService } from '@app/resource-lib';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country, City, State, User, Category, PriceRange, ResponseTime, Tag, Banner, Testimonial, AdminSetting, ChatRequest , Admin} from 'common/models';
import { ResourceController } from './resource.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Country, State, City, Category, PriceRange, ResponseTime, Tag, Banner, Testimonial, AdminSetting, ChatRequest, Admin])],
  controllers: [ResourceController],
  providers: [ResourceLibService],
})
export class ResourceModule {}
