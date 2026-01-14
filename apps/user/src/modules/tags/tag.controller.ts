import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders, Public } from 'common/decorators';
import { TagLibService } from '@app/tag-lib';
import { ConfigService } from '@nestjs/config';
import { tagDto } from './dto/tagDto.dto';

@ApiTags('Tag')
@Controller('tags')
@CustomHeaders()
export class TagController {
  constructor(
    private readonly tagLibService: TagLibService,
    private configService: ConfigService,
  ) {}

  @Public()
  @ApiOperation({ summary: 'tags' })
  @Get()
  async list(@Query() categoryId: tagDto) {
    return this.tagLibService.getTag(categoryId);
  }


}
