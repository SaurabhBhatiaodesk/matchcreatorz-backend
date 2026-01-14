import { UtilLibService } from '@app/util-lib';
import { UploadFilesDto } from '@app/util-lib/dto';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders, Public } from 'common/decorators';

@ApiTags('Util')
@Controller('utils')
@CustomHeaders()
export class UtilController {
  constructor(private readonly utilLibService: UtilLibService) {}

  @Public()
  @ApiOperation({ summary: 'S3 presigned upload urls' })
  @Get('s3-upload-urls')
  async generateS3UploadUrls(@Query() uploadFilesDto: UploadFilesDto) {
    return this.utilLibService.generateS3PresignedUploadUrls(uploadFilesDto);
  }
}
