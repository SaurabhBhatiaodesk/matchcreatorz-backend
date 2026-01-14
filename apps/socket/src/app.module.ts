import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { CorsMiddleware, HelmetMiddleware } from 'common/middlewares';
import { DatabaseConfigModule, I18nConfigModule } from 'common/modules';

import { ChatModule } from './modules/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    I18nConfigModule,
    DatabaseConfigModule,
    ChatModule
  ],

  providers: [
    ConfigService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
  exports: [ConfigService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware, HelmetMiddleware).forRoutes('*');
  }
}
