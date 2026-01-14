import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    request.headers['accept-language'] =
      request.headers['accept-language'] || 'en';

    request.headers['x-market-place-platform'] =
      request.headers['x-market-place-platform'] || 'ios';

    request.headers['x-market-place-version'] =
      request.headers['x-market-place-version'] || '1.0.0';

    request.headers['user-type'] = request.headers['user-type'] || 'SELLER'; 

    return next.handle().pipe();
  }
}
