import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { Admin, Otp, User, Country, State, City, Category, Service, Booking, SupportRequest } from 'common/models';
import { JwtAdminAuthGuard } from 'common/guards/jwt-admin-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Admin, Otp, User, Country, State, City, Category, Service, Booking,SupportRequest])],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAdminAuthGuard,
    },
    Reflector,
    AuthService,
  ],
})
export class AuthModule {}
