import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category, Tag } from 'common/models';
import { CategoryLibService } from '@app/category-lib';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Tag])],
  controllers: [CategoryController],
  providers: [CategoryLibService],
})
export class CategoryModule {}
