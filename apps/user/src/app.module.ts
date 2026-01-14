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
import { AuthModule } from './modules/auth/auth.module';

import { MyAccountModule } from './modules/my-account/my-account.module';
import { PageModule } from './modules/pages/page.module';
import { TagModule }  from './modules/tags/tag.module';
import { UserModule } from './modules/users/user.module';
import { UtilModule } from './modules/utils/util.module';
import { ServiceModule } from './modules/services/service.module';
import { OfferModule } from './modules/offers/offer.module';
import { BookingModule } from './modules/bookings/booking.module';
import { ConnectModule } from './modules/connects/connect.module';
import { WalletModule } from './modules/wallets/wallet.module';
import { ChatModule } from './modules/chats/chat.module';
import { BidModule } from './modules/my-bid/my-bid.module';
import { ResourceModule } from './modules/resource/resource.module';
import { NotificationModule } from './modules/notifications/notification.module';
import { CronModule } from './modules/crons/cron.module';
import { MailModule } from './mail/mail.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    I18nConfigModule,
    DatabaseConfigModule,
    AuthModule,
    MyAccountModule,
    PageModule,
    UserModule,
    UtilModule,
    TagModule,
    ResourceModule,
    ServiceModule,
    ConnectModule,
    WalletModule,
    NotificationModule,
    ChatModule,
    BidModule,
    OfferModule,
    BookingModule,
    CronModule,
    MailModule
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
