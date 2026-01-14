import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = this.getStatus(exception);

    response.status(status).json({
      success: false,
      message: exception.message,
      data: {},
    });
  }

  getStatus(exception: HttpException) {
    if (exception instanceof BadRequestException) return HttpStatus.OK;

    return exception.getStatus();
  }
}
