import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import {
  LoginDto,
  ResetPasswordDto,
  ForgotPasswordDto,
  UpdateAvatarDto,
  ChangePasswordDto,
} from './dto';
import {
  Admin,
  Booking,
  Category,
  City,
  Country,
  Service,
  State,
  SupportRequest,
  User,
} from 'common/models';
import { BookingStatus, UserType } from 'common/enums';

import {
  JwtUtility,
  comparePassword,
  hashPassword,
  utcDateTime,
} from 'common/utils';
import { ResponseSuccess } from 'common/dto';
import { I18nService } from 'nestjs-i18n';
import { MailService } from '../../mail/mail.service';
import { DateRangeDto } from './dto/dateRange.dto';
import { ServiceStatusType } from 'common/enums/serviceStatus.enum';

const currentTime = new Date();

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(SupportRequest) private supportRequestRepository: Repository<SupportRequest>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    private readonly i18n: I18nService,
    private readonly mailService: MailService,
    @InjectRepository(Country) private resourceRepository: Repository<Country>,
    @InjectRepository(State) private stateRepository: Repository<State>,
    @InjectRepository(City) private cityRepository: Repository<City>,
    @InjectRepository(Category) private categoryRepository: Repository<Category>,
    @InjectRepository(Service) private serviceRepository: Repository<Service>,
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
  ) {}

  public async login(loginDto: LoginDto, req: any): Promise<any> {
    const { email, password } = loginDto;
    const admin = await this.adminRepository.findOne({
      where: {
        email,
        isDeleted: false,
      },
    });

    if (!admin) {
      throw new BadRequestException(this.i18n.t('test.ADMIN.NOT_FOUND'));
    }

    if (admin.isSuspended) {
      throw new BadRequestException(
        this.i18n.t('test.ADMIN.ACCOUNT_SUSPENDED'),
      );
    }

    // match password condition
    const passwordMatched = await comparePassword(password, admin.password);
    if (!passwordMatched) {
      throw new BadRequestException(
        this.i18n.t('test.AUTH.INVALID_CREDENTIALS'),
      );
    }
    admin.authTokenIssuedAt = utcDateTime();
    await this.adminRepository.save(admin);

    const platform = req.headers['x-market-place-platform'];

    const payload = {
      sub: admin.id,
      aud: platform,
      iat: utcDateTime(admin.authTokenIssuedAt).valueOf(),
    };
    const token = JwtUtility.generateToken(payload);

    return new ResponseSuccess(this.i18n.t('test.AUTH.LOGIN'), {
      token,
      ...admin,
    });
  }

  public async profile(req: any): Promise<any> {
    const { admin } = req;

    if (!admin) {
      throw new BadRequestException(this.i18n.t('test.ADMIN.NOT_FOUND'));
    }
    return new ResponseSuccess('PROFILE', { ...admin });
  }

  async updateProfile(updateProfileDto: any, req: any): Promise<any> {
    const { admin } = req;
    const { firstName, lastName, email, avatar } = updateProfileDto;

    // if admin email that stored in database and new email are not equal then check email already registered or not
    if (admin.email !== email && email && email != '') {
      const checkEmail = await this.adminRepository.findOne({
        where: {
          email,
        },
      });

      if (checkEmail) {
        throw new BadRequestException(
          this.i18n.t('test.ADMIN.EMAIL_ALREADY_EXISTS'),
        );
      }
      // update email
      admin.email = email;
    }

    if (avatar) {
      admin.avatar = avatar;
    }

    admin.firstName = firstName;
    admin.lastName = lastName;

    admin.fullName = firstName + ' ' + lastName;

    await this.adminRepository.save(admin);

    return new ResponseSuccess(this.i18n.t('test.ADMIN.PROFILE_UPDATED'), {
      admin,
    });
  }

  async updateAvatar(updateAvatarDto: UpdateAvatarDto, req: any): Promise<any> {
    const { admin } = req;
    const { avatar } = updateAvatarDto;

    admin.avatar = avatar;
    await this.adminRepository.save(admin);

    return new ResponseSuccess(this.i18n.t('test.ADMIN.AVATAR_UPDATED'), {
      admin,
    });
  }

  public async forgotPassword(forgotPassword: ForgotPasswordDto): Promise<any> {
    const { email } = forgotPassword;

    const admin = await this.adminRepository.findOne({
      where: {
        email,
        isDeleted: false,
      },
    });

    if (!admin) {
      throw new BadRequestException(this.i18n.t('test.ADMIN.NOT_FOUND'));
    }

    if (admin.isSuspended) {
      throw new BadRequestException(
        this.i18n.t('test.ADMIN.ACCOUNT_SUSPENDED'),
      );
    }
    const futureTime = new Date(currentTime.getTime() + 20 * 60 * 1000); // 20 minute validate
    // hashing
    const validateString =
      (Math.random() + 1).toString(36).substring(12) +
      admin.password?.substring(0, 12);
    admin.resetToken = validateString;
    admin['authTokenIssuedAt'] = new Date(futureTime.getTime());
    await this.adminRepository.save(admin);

    // send mail
    await this.mailService.sendAdminResetPasswordMail(admin, admin.resetToken);
    return new ResponseSuccess(
      'Verification token sent to registred email',
      {},
    );
  }

  public async changePassword(
    changePasswordDto: ChangePasswordDto,
    req: any,
  ): Promise<any> {
    const { admin } = req;
    const { oldPassword, newPassword } = changePasswordDto;

    const adminData = await this.adminRepository.findOne({
      where: {
        id: admin.id,
      },
    });

    if (!adminData) {
      throw new BadRequestException(this.i18n.t('test.ADMIN.NOT_FOUND'));
    }

    // match current password
    const passwordMatched = await comparePassword(
      oldPassword,
      adminData.password,
    );
    if (!passwordMatched) {
      throw new BadRequestException(
        this.i18n.t('test.ADMIN.INVALID_CURRENT_PASSWORD'),
      );
    }

    adminData.password = await hashPassword(newPassword);
    await this.adminRepository.save(adminData);
    return new ResponseSuccess(this.i18n.t('test.ADMIN.PASSWORD_CHANGED'), {
      adminData,
    });
  }

  public async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<any> {
    const { validateString, newPassword } = resetPasswordDto;

    const admin = await this.adminRepository.findOne({
      where: {
        resetToken: validateString,
        isDeleted: false,
      },
    });

    if (
      admin?.authTokenIssuedAt &&
      admin.authTokenIssuedAt < currentTime
    ) {
      throw new BadRequestException(this.i18n.t('test.TOKEN.EXPIRED'));
    }

    if (!admin) {
      throw new BadRequestException(this.i18n.t('test.ADMIN.NOT_FOUND'));
    }

    if (admin.isSuspended) {
      throw new BadRequestException(
        this.i18n.t('test.ADMIN.ACCOUNT_SUSPENDED'),
      );
    }
    // update admin
    admin.password = await hashPassword(newPassword);

    admin.resetToken = '';
    admin.authTokenIssuedAt = currentTime;

    await this.adminRepository.save(admin);

    return new ResponseSuccess(this.i18n.t('test.AUTH.RESET_PASSWORD'));
  }

  public async logout(req: any): Promise<any> {
    const { admin } = req;
    const adminData = await this.adminRepository.findOne({
      where: {
        id: admin.id,
      },
    });

    admin.authTokenIssuedAt = null;
    admin.deviceToken = null;
    await this.adminRepository.save(adminData);
    return new ResponseSuccess(this.i18n.t('test.AUTH.LOGOUT'));
  }

  public async dashboard(req: any, dateRange: DateRangeDto): Promise<any> {
    const { admin } = req;
    let matchCriteria: { [key: string]: any } = {
      isDeleted: false
    };

    if (dateRange?.startDate && dateRange?.endDate) {
      matchCriteria = {
        ...matchCriteria,
        created: Between<string>(dateRange?.startDate, dateRange?.endDate),
      };
    }

    const totalSellers = await this.userRepository.count({
      where: {
        ...matchCriteria,
        type: UserType.SELLER,
      },
    });
    const totalBuyers = await this.userRepository.count({
      where: { ...matchCriteria, type: UserType.BUYER },
    });

    delete matchCriteria.isPhoneVerified;

    if (dateRange?.startDate && dateRange?.endDate) {
      matchCriteria.created = Between<string>(dateRange?.startDate, dateRange?.endDate);
    }
        
    const query = await this.bookingRepository
    .createQueryBuilder('booking')
    .select('SUM(booking.totalAmount)', 'totalSum')
    .where('booking.status = :status', { status: BookingStatus.COMPLETED })
    .andWhere('booking.isDeleted = :isDeleted', { isDeleted: false })
    .andWhere('booking.isSuspended = :isSuspended', { isSuspended: false })

    const platformFee = await this.bookingRepository
    .createQueryBuilder('booking')
    .select('SUM(booking.platformFee)', 'totalSum')
    .where('booking.status = :status', { status: BookingStatus.COMPLETED })
    .andWhere('booking.isDeleted = :isDeleted', { isDeleted: false })
    .andWhere('booking.isSuspended = :isSuspended', { isSuspended: false })

    if (dateRange?.startDate && dateRange?.endDate) {
      query.andWhere('booking.created BETWEEN :startDate AND :endDate', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
    }
    
    const totalSum:any = await query.getRawOne();
    const totalPlatformFeeSum:any = await platformFee.getRawOne();

    const maxPaymentRCBySeller = await this.bookingRepository
    .createQueryBuilder('booking')
    .select('seller.id', 'sellerId')
    .addSelect('seller.fullName', 'sellerfullName')
    .addSelect('COUNT(booking.id)', 'completedJobCount')
    .addSelect('SUM(booking.totalAmount)', 'totalAmount')  // Calculate sum of total amount
    .innerJoin('booking.seller', 'seller')  // Join with the seller
    .where('booking.status = :status', { status: BookingStatus.COMPLETED })  // Filter for completed bookings
    .andWhere('booking.isSettled = true')  // Filter where settlement is true
    .groupBy('seller.id')  // Group by seller to count completed jobs per seller
    .orderBy('completedJobCount', 'DESC')  // Order by job count in descending order to get the top seller
    .limit(1)  // Limit to the seller with the most completed jobs
    .getRawOne();
    
    const ObjResp = {
      activeJobs: await this.serviceRepository.count({
        where: {
          status: ServiceStatusType.ONGOING,
          ...matchCriteria,
        },
      }),
      canceledJobs: await this.bookingRepository.count({
        where: {
          status: BookingStatus.CANCELLED,
          ...matchCriteria,
        },
      }),
      activeChats: await this.supportRequestRepository.count({
        where: {
          adminId: admin.id,
          isDeleted: false,
          isSuspended: false,
        }
      }),
      recievedPayments: Number(totalSum?.totalSum),
      completedJobs: await this.bookingRepository.count({
        where: {
          status: BookingStatus.COMPLETED,
          ...matchCriteria,
        },
      }),
      commisionEarnings: Number(totalPlatformFeeSum?.totalSum),
      paidAmountToSellers: maxPaymentRCBySeller?.totalAmount ?? 0,
      totalBookings: await this.bookingRepository.count({
        where: {
          ...matchCriteria,
        },
      }),
      totalUsers: await this.userRepository.count({ where: matchCriteria }),
      admin: admin,
      totalSellers: totalSellers,
      totalBuyers: totalBuyers,
    };

    return new ResponseSuccess('DASHBOARD', { ...ObjResp });
  }

  async getAdminById(id: number): Promise<any> {
    const adminData = await this.adminRepository
      .createQueryBuilder('admin')
      .where('admin.id = :id', { id })
      .getOne();

    return adminData;
  }

  async getCountry(): Promise<any> {
    const countryData = await this.resourceRepository.find({
      order: {
        countryName: 'ASC',
      },
    });

    if (!countryData) {
      throw new BadRequestException(this.i18n.t('test.USER.NOT_FOUND'));
    }

    return new ResponseSuccess(this.i18n.t('test.USER.INFO'), {
      country: countryData,
    });
  }

  async getStateByCountryId(id: number): Promise<any> {
    const countryData = await this.stateRepository.find({
      where: { countryId: id },
      order: {
        stateName: 'ASC',
      },
    });

    if (!countryData) {
      throw new BadRequestException(this.i18n.t('test.USER.NOT_FOUND'));
    }

    return new ResponseSuccess(this.i18n.t('test.USER.INFO'), {
      state: countryData,
    });
  }

  async getCityByStateId(id: any): Promise<any> {
    const countryData = await this.cityRepository.find({
      where: { stateId: id },
      order: {
        cityName: 'ASC',
      },
    });

    if (!countryData) {
      throw new BadRequestException(this.i18n.t('test.USER.NOT_FOUND'));
    }

    return new ResponseSuccess(this.i18n.t('test.USER.INFO'), {
      city: countryData,
    });
  }

  async getCategory(): Promise<any> {
    const categoryData = await this.categoryRepository.find({
      where : {
        isDeleted : false,
        isSuspended : false
      },
      order: {
        created: 'DESC',
      },
    });

    if (!categoryData) {
      throw new BadRequestException(this.i18n.t('test.USER.NOT_FOUND'));
    }

    return new ResponseSuccess(this.i18n.t('test.USER.INFO'), {
      category: categoryData,
    });
  }
}
