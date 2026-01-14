import { applyDecorators } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

export function CustomHeaders() {
  return applyDecorators(
    ApiHeader({
      name: 'accept-language',
      required: true,
      schema: { type: 'string', default: 'en', enum: ['en', 'ro'] },
    }),
    ApiHeader({
      name: 'x-market-place-platform',
      required: true,
      schema: { type: 'string', default: 'ios', enum: ['ios', 'android', 'web'] },
    }),
    ApiHeader({
      name: 'x-market-place-version',
      required: true,
      schema: {
        type: 'string',
        default: '1.0.0',
        pattern: '^\\d+\\.\\d+\\.\\d+$',
      },
    }),
    ApiHeader({
      name: 'user-type',
      required: true,
      schema: { type: 'string', default: 'SELLER', enum: ['ADMIN','SELLER', 'BUYER'] },
    }),
  );
}
