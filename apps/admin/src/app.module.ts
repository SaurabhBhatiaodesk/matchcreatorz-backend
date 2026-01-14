import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorsMiddleware, HelmetMiddleware } from 'common/middlewares';
import { Admin } from 'common/models';
import { DatabaseConfigModule, I18nConfigModule } from 'common/modules';
import { join } from 'path';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './modules/auth/auth.module';
import { PageModule } from './modules/pages/page.module';
import { SettingModule } from './modules/settings/setting.module';
import { UserModule } from './modules/users/user.module';
import { UtilModule } from './modules/utils/util.module';
import { BuyerModule } from './modules/buyers/buyer.module';
import { SellerModule } from './modules/sellers/seller.module';
import { CategoryModule } from './modules/category/category.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { BookingModule } from './modules/bookings/booking.module';
import { ReviewModule } from './modules/reviews/review.module';
import { ConnectModule } from './modules/connects/connect.module';

import { ResourceModule } from './modules/resource/resource.module';

import { StatisticsModule } from './modules/statistics/statistics.module';

import { SupportModule } from './modules/support/support.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'images'),
      serveRoot: '/images',
    }),
    I18nConfigModule,
    DatabaseConfigModule,
    AuthModule,
    MailModule,
    PageModule,
    SettingModule,
    UserModule,
    UtilModule,
    BuyerModule,
    SellerModule,
    CategoryModule,
    WalletModule,
    BookingModule,
    ReviewModule,
    ConnectModule,
    ResourceModule,
    StatisticsModule,
    SupportModule
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
  exports: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware, HelmetMiddleware).forRoutes('*');
  }
}
