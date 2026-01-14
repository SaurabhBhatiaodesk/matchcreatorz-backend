import { Controller, Get, Param, Render } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders, Public } from 'common/decorators';
import { PageLibService } from '@app/page-lib';
import { ConfigService } from '@nestjs/config';

@ApiTags('Page')
@Controller('pages')
@CustomHeaders()
export class PageController {
  constructor(
    private readonly pageLibService: PageLibService,
    private configService: ConfigService,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Page view' })
  @Render('page')
  @Get('page-view/:slug')
  async getBySlug(@Param('slug') slug: string) {
    const page = await this.pageLibService.getBySlug(slug);
    const siteTitle = this.configService.get<string>('SITE_TITLE');
    return { siteTitle, page };
  }

  @Public()
  @ApiOperation({ summary: 'Page detail' })
  @Get(':id/info')
  async getById(@Param('id') id: number) {
    return this.pageLibService.getById(id);
  }
}
