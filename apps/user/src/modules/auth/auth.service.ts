import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, MoreThanOrEqual, Repository } from 'typeorm';
import {
  LoginDto,
  SignupDto,
  RequestOtpDto,
  VerifyOtpDto,
  ResetPasswordDto,
  SocialLoginDto,
} from './dto';
import { Otp, User, SocialAccount, Country, State } from 'common/models';
import {
  Language,
  NotificationStatus,
  NotificationType,
  OtpType,
  UserType,
  VerificationType,
} from 'common/enums';
import {
  FcmService,
  JwtUtility,
  comparePassword,
  generateOtp,
  hashPassword,
  otpValidTill,
  utcDateTime,
} from 'common/utils';
import { ResponseSuccess } from 'common/dto';
import { I18nService } from 'nestjs-i18n';
const currentTime = new Date();
import { MailService } from '../../mail/mail.service';
import { ResetPasswordURLDto } from './dto/publicUrl.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly fcmService: FcmService,
    private readonly mailService: MailService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Otp) private otpRepository: Repository<Otp>,
    @InjectRepository(SocialAccount)
    private socialAccountRepository: Repository<SocialAccount>,
    @InjectRepository(Country) private countryRepository: Repository<Country>,
    @InjectRepository(State) private stateRepository: Repository<State>,
    private readonly i18n: I18nService,
  ) {}

  public async signup(signupDto: SignupDto): Promise<any> {
    const { email, countryCode, phone, type, countryId, stateId } = signupDto;

    // Validate countryId and stateId if provided (for SELLER type)
    if (countryId) {
      console.log(`[Signup] Validating countryId: ${countryId}`);
      const country = await this.countryRepository.findOne({
        where: { id: countryId },
      });
      if (!country) {
        console.error(`[Signup] Country with id ${countryId} not found in database`);
        throw new BadRequestException(
          `Invalid countryId: ${countryId}. Country does not exist in database.`,
        );
      }
      console.log(`[Signup] Country validated: ${country.countryName} (ID: ${country.id})`);
    }

    if (stateId) {
      console.log(`[Signup] Validating stateId: ${stateId}`);
      const state = await this.stateRepository.findOne({
        where: { id: stateId },
      });
      if (!state) {
        console.error(`[Signup] State with id ${stateId} not found in database`);
        throw new BadRequestException(
          `Invalid stateId: ${stateId}. State does not exist in database.`,
        );
      }
      // Also verify that state belongs to the provided country
      if (countryId && state.countryId !== countryId) {
        console.error(`[Signup] State ${stateId} does not belong to country ${countryId}`);
        throw new BadRequestException(
          `State with id ${stateId} does not belong to country ${countryId}.`,
        );
      }
      console.log(`[Signup] State validated: ${state.stateName} (ID: ${state.id})`);
    }

    // check user already exists or not
    const formattedPhone = `${countryCode}${phone}`;
    // get language from headers
    const language = Language.EN;

    let user = await this.userRepository.findOne({
      where: {
        formattedPhone,
        isPhoneVerified: true,
        isDeleted: false,
        //type: type,
      },
    });

    if (user) {
      throw new BadRequestException(
        this.i18n.t('test.AUTH.PHONE_ALREADY_EXISTS'),
      );
    }
    // check email already registered or not
    if (email) {
      user = await this.userRepository.findOne({
        where: {
          email,
          isEmailVerified: true,
          isDeleted: false,
          //type: type,
        },
      });
      if (user) {
        throw new BadRequestException(
          this.i18n.t('test.AUTH.EMAIL_ALREADY_EXISTS'),
        );
      }
    }

    // delete all same number not verified old entries from user collection
    await this.userRepository.update(
      { formattedPhone, isPhoneVerified: false, isDeleted: false, type: type },
      { isDeleted: true },
    );

    // save user
    user = this.userRepository.create({
      language,
      step: 1,
      isProfileUpdated: false,
      isFAQUpdated: false,
      isPorfolioUpdated: false,
      formattedPhone,
      ...signupDto,
      password: await hashPassword(signupDto.password),
    });

    let savedUser = await this.userRepository.save(user);

    // Phone Otp
    let otp: Otp;
    otp = await this.otpRepository.findOne({
      where: {
        formattedPhone,
        type: OtpType.SIGN_UP,
        userType: type,
      },
    });
    // if otp not found
    if (!otp) {
      otp = this.otpRepository.create({ userType: type });
    }
    otp.type = OtpType.SIGN_UP;
    otp.userType = type;
    otp.formattedPhone = formattedPhone;
    otp.otp = generateOtp();
    otp.validTill = otpValidTill();
    otp.isVerified = false;
    await this.otpRepository.save(otp);

    //twilio
    const message = `Your verification code is: ${otp.otp} for Matchcreatorz. Please enter this code to verify your identity. The code is valid for 10 minutes.`;
    await this.fcmService.sendSMS(formattedPhone, message);

    //Email Otp
    let emailotp: Otp;
    emailotp = await this.otpRepository.findOne({
      where: {
        email,
        type: OtpType.SIGN_UP,
        userType: type,
      },
    });
    // if otp not found
    if (!emailotp) {
      emailotp = this.otpRepository.create({ userType: type });
    }
    emailotp.type = OtpType.SIGN_UP;
    emailotp.userType = type;
    emailotp.email = email;
    emailotp.otp = generateOtp();
    emailotp.validTill = otpValidTill();
    emailotp.isVerified = false;
    await this.otpRepository.save(emailotp);

    //sent verification email with link with welcome msg
    if (savedUser) {
      const futureTime = new Date(currentTime.getTime() + 20 * 60 * 1000); // 20 minute validate
      // hashing
      const validateString = Math.floor(
        100000000000 + Math.random() * 900000000000,
      ).toString();

      savedUser.resetToken = validateString;
      savedUser['authTokenIssuedDateAt'] = new Date(futureTime.getTime());
      await this.userRepository.save(savedUser);

      // send mail
      await this.mailService.sendMailToUserForWelComeMail(
        savedUser,
        savedUser.resetToken,
        emailotp.otp,
      );
    }

    return new ResponseSuccess(this.i18n.t('test.OTP.SENT'));
  }

  public async requestOtp(
    requestOtpDto: RequestOtpDto,
    req: any,
  ): Promise<any> {
    const { type, phone, email, verificationType } = requestOtpDto;

    const formattedPhone = `${phone}`;

    const userType = req.headers['user-type'];

    // validate request
    this.validateOtpRequest(type, verificationType);

    // check user existance
    await this.checkExistingUser(
      type,
      verificationType,
      formattedPhone,
      email,
      userType,
    );

    // generate otp
    await this.generateOtp(
      verificationType,
      formattedPhone,
      email,
      type,
      userType,
    );

    return new ResponseSuccess(this.i18n.t('test.OTP.SENT'));
  }

  public async verifyOtp(verifyOtpDto: VerifyOtpDto, req: any): Promise<any> {
    const { type, phone, email, verificationType, otp } = verifyOtpDto;

    const formattedPhone = `${phone}`;
    const userType = req.headers['user-type'];

    // validate request
    this.validateOtpRequest(type, verificationType);

    // check user existance
    await this.checkExistingUser(
      type,
      verificationType,
      formattedPhone,
      email,
      userType,
    );


    // validate otp
    await this.validateOtp(
      verificationType,
      formattedPhone,
      email,
      type,
      otp,
      userType,
    );

 

    // if type is signup then check user entry in database
    if (type === OtpType.SIGN_UP) {
      const matchCondition: Record<string, any> = {
        isSuspended: false,
        isDeleted: false,
        type: userType,
      };
      if (verificationType == VerificationType.PHONE) {
        matchCondition.formattedPhone = formattedPhone;
      } else {
        // if verification type is email then get user data by email
        matchCondition.email = email;
      }

      const user = await this.userRepository.findOne({
        where: matchCondition,
      });

      if (!user) {
        throw new BadRequestException(this.i18n.t('test.USER.NOT_FOUND'));
      }

      // if verification type is phone then mark phone verification as true
      if (verificationType == VerificationType.PHONE) {
        user.isPhoneVerified = true;
      } else {
        // if verification type is email then mark email verification as true
        user.isEmailVerified = true;
      }

      user.authTokenIssuedAt = utcDateTime().valueOf();
      await this.userRepository.save(user);

      // Send push to admin
      await this.fcmService.saveNotification({
        deviceToken: '',
        deviceType: '',
        title: `New ${user?.fullName ?? 'User'} (${user.type}) Added`,
        description: `You have new (${user.type}) added in your manager`,
        type: NotificationType.BROADCAST,
        status:
          user?.type === 'BUYER'
            ? NotificationStatus.NEW_BUYER_ADDED
            : NotificationStatus.NEW_SELLER_ADDED,
        receiverId: 1,
        senderType: user.type,
        receiverType: UserType.ADMIN,
      });

      const platform = req.headers['x-market-place-platform'];

      const payload = {
        sub: user.id,
        aud: platform,
        iat: user.authTokenIssuedAt,
      };
      const token = JwtUtility.generateToken(payload);
      // Delete Password & Autoken issue key
      ['password', 'authTokenIssuedAt'].forEach((key) => delete user[key]);
      return new ResponseSuccess(this.i18n.t('test.AUTH.LOGIN'), {
        token,
        user,
      });
    }

    // if type is update then check user entry in database
    if (type === OtpType.UPDATE_EMAIL) {
      const matchCondition: Record<string, any> = {
        isSuspended: false,
        isDeleted: false,
        type: userType,
      };

      matchCondition.tempEmail = email;

      const user = await this.userRepository.findOne({
        where: matchCondition,
      });

      if (!user) {
        throw new BadRequestException(this.i18n.t('test.USER.NOT_FOUND'));
      }

      user.isEmailVerified = true;
      user.email = email;
      user.tempEmail = '';

      // user.authTokenIssuedAt = utcDateTime().valueOf();
      await this.userRepository.save(user);

      // Delete Password & Autoken issue key
      ['password', 'authTokenIssuedAt'].forEach((key) => delete user[key]);
      return new ResponseSuccess(this.i18n.t('test.OTP.VERIFIED'), {});
    }

  
    if (type === OtpType.UPDATE_PHONE) {
      const matchCondition: Record<string, any> = {
        isSuspended: false,
        isDeleted: false,
        type: userType,
      };
      matchCondition.tempFormattedPhone = formattedPhone;
      const user = await this.userRepository.findOne({
        where: matchCondition,
      });
      if (!user) {
        throw new BadRequestException(this.i18n.t('test.USER.NOT_FOUND'));
      }

      user.isPhoneVerified = true;
      user.formattedPhone = formattedPhone;
      user.phone = user.tempPhone;
      user.countryCode = user.tempCountryCode;
      user.tempPhone = '';
      user.tempCountryCode = '';
      user.tempFormattedPhone = '';

      // user.authTokenIssuedAt = utcDateTime().valueOf();
      await this.userRepository.save(user);

      // Delete Password & Autoken issue key
      ['password', 'authTokenIssuedAt'].forEach((key) => delete user[key]);
      return new ResponseSuccess(this.i18n.t('test.OTP.VERIFIED'), {});
    }
    return new ResponseSuccess(this.i18n.t('test.OTP.VERIFIED'));
  }

  public async login(loginDto: LoginDto, req: any): Promise<any> {
    const { password, deviceToken, type, userName } = loginDto;

    let user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.type = :type', { type })
      .andWhere(
        new Brackets((qb) => {
          qb.where('user.email = :email AND user.isEmailVerified = true', {
            email: userName,
          }).orWhere(
            'user.formattedPhone = :formattedPhone AND user.isPhoneVerified = true',
            { formattedPhone: userName },
          );
        }),
      )
      .getOne();

    if (!user) {
      user = await this.userRepository
        .createQueryBuilder('user')
        .where('user.type = :type', { type })
        .andWhere('user.email = :email', { email: userName })
        .getOne();
      if (user && !user?.isEmailVerified) {
        throw new BadRequestException(
          this.i18n.t('test.USER.EMAIL_NOT_VERIFIED_LOGIN'),
        );
      }
      throw new BadRequestException(this.i18n.t('test.USER.NOT_FOUND'));
    }

    if (user.isSuspended) {
      throw new BadRequestException(this.i18n.t('test.USER.ACCOUNT_SUSPENDED'));
    }

    // if phone number is not verified then send OTP
    if (!user.isPhoneVerified && !user.isEmailVerified) {
      const otp = this.otpRepository.create();
      otp.type = OtpType.SIGN_UP;
      otp.formattedPhone = user.countryCode + user.phone; // formattedPhone;
      otp.otp = generateOtp();
      otp.validTill = otpValidTill();
      otp.isVerified = false;
      otp.userType = user.type;
      await this.otpRepository.save(otp);
      return new ResponseSuccess(
        this.i18n.t('test.AUTH.ACCOUNT_NOT_VERIFIED_OTP_SENT'),
      );
    }
    // match password condition
    const passwordMatched = await comparePassword(password, user.password);
    if (!passwordMatched) {
      throw new BadRequestException(
        this.i18n.t('test.AUTH.INVALID_CREDENTIALS'),
      );
    }

    deviceToken && (user.deviceToken = deviceToken);
    user.authTokenIssuedAt = utcDateTime().valueOf();
    await this.userRepository.save(user);

    const platform = req.headers['x-market-place-platform'];

    const payload = {
      sub: user.id,
      aud: platform,
      iat: user.authTokenIssuedAt,
    };
    const token = JwtUtility.generateToken(payload);
    // Delete password & authTokenIssuedAt
    ['password', 'authTokenIssuedAt'].forEach((key) => delete user[key]);
    return new ResponseSuccess(this.i18n.t('test.AUTH.LOGIN'), {
      token,
      user,
    });
  }

  public async socialLogin(
    socilaLoginDto: SocialLoginDto,
    req: any,
  ): Promise<any> {
    try {
      const { type, fullName, email, socialType, socialId, deviceToken } =
        socilaLoginDto;
      // get language from headers
      const language = Language.EN;
      const platform = req.headers['x-market-place-platform'] || 'web'; // Default fallback
      const social = await this.socialAccountRepository.findOne({
        where: { socialType, socialId },
        relations: ['user'],
      });

      if (social) {
          if (social?.user?.type !== type) {
            const oppositeType = type === 'BUYER' ? 'SELLER' : 'BUYER';
            throw new BadRequestException(
              this.i18n.t(`test.USER.ALREADY_REGISTER_${oppositeType}`)
            );
          }
        let user = await this.userRepository.findOne({
          where: { id: social.user.id, isDeleted: false },
        });

        if (!user) {
          throw new BadRequestException(this.i18n.t('test.USER.NOT_FOUND'));
        }

        if (user.isSuspended) {
          throw new BadRequestException(
            this.i18n.t('test.USER.ACCOUNT_SUSPENDED'),
          );
        }
        if (deviceToken) {
          user.deviceToken = deviceToken;
        }

        user.authTokenIssuedAt = utcDateTime().valueOf();
        await this.userRepository.save(user);

        const payload = {
          sub: user.id,
          aud: platform,
          iat: user.authTokenIssuedAt,
        };
        const token = JwtUtility.generateToken(payload);

        delete user.password;
        delete user.authTokenIssuedAt;

        return new ResponseSuccess(this.i18n.t('test.AUTH.LOGIN'), {
          token,
          user,
        });
      } else {
        //check with email
        let user = null;
        if (email) {
          user = await this.userRepository.findOne({
            where: { email, isEmailVerified: true, isDeleted: false },
          });
        }

        if (!user) {
          const newUser = this.userRepository.create({
            language,
            step: 1,
            isProfileUpdated: false,
            isFAQUpdated: false,
            isPorfolioUpdated: false,
            type,
            fullName,
            isEmailVerified: !!email,
            deviceToken,
          });

          if (email) {
            newUser.email = email;
          }

          user = await this.userRepository.save(newUser);
        }
        // Link social account
        const newSocial = this.socialAccountRepository.create({
          user,
          socialType,
          socialId,
        });
        await this.socialAccountRepository.save(newSocial);
        // Token info
        user.authTokenIssuedAt = utcDateTime().valueOf();
        await this.userRepository.save(user);

        const payload = {
          sub: user.id,
          aud: platform,
          iat: user.authTokenIssuedAt,
        };
        const token = JwtUtility.generateToken(payload);

        delete user.password;
        delete user.authTokenIssuedAt;
        return new ResponseSuccess(this.i18n.t('test.AUTH.LOGIN'), {
          token,
          user,
        });
      }
    } catch (error) {
        console.log("erooorrrr==>", error)
        return error;
    }  
  }

  public async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    req: any,
  ): Promise<any> {
    const { phone, email, password, verificationType } = resetPasswordDto;
    const formattedPhone = `${phone}`;

    const userType = req.headers['user-type'];

    // check forgot password otp exists or not
    const matchCondition: Record<string, any> = {
      type: OtpType.FORGOT_PASSWORD,
      validTill: MoreThanOrEqual(utcDateTime()),
      isVerified: true,
      userType,
    };
    // match with phone
    if (verificationType === VerificationType.PHONE) {
      matchCondition.formattedPhone = formattedPhone;
    } else {
      // match with email
      matchCondition.email = email;
    }
    const otp = await this.otpRepository.findOne({
      where: matchCondition,
    });

    if (!otp) {
      throw new BadRequestException(this.i18n.t('test.AUTH.OTP_NOT_VERIFIED'));
    }

    const usermatchCondition: Record<string, any> = {
      isSuspended: false,
      isDeleted: false,
      type: userType,
    };

    if (verificationType == VerificationType.PHONE) {
      usermatchCondition.formattedPhone = formattedPhone;
    } else {
      // if verification type is email then get user data by email
      usermatchCondition.email = email;
    }

    const user = await this.userRepository.findOne({
      where: usermatchCondition,
    });

    if (!user) {
      throw new BadRequestException(this.i18n.t('test.USER.NOT_FOUND'));
    }

    if (user.isSuspended) {
      throw new BadRequestException(this.i18n.t('test.USER.ACCOUNT_SUSPENDED'));
    }

    user.password = await hashPassword(password);
    await this.userRepository.save(user);

    otp.validTill = null;
    await this.otpRepository.save(otp);

    return new ResponseSuccess(this.i18n.t('test.USER.PASSWORD_CHANGED'));
  }

  private validateOtpRequest(
    type: OtpType,
    verificationType: VerificationType,
  ): void {
    const validTypes = [
      OtpType.SIGN_UP,
      OtpType.VERIFY_PHONE,
      OtpType.VERIFY_EMAIL,
      OtpType.FORGOT_PASSWORD,
      OtpType.UPDATE_EMAIL,
      OtpType.UPDATE_PHONE,
    ];
    const validVerificationTypes = [
      VerificationType.PHONE,
      VerificationType.EMAIL,
    ];

    if (
      !validTypes.includes(type) ||
      !validVerificationTypes.includes(verificationType)
    ) {
      throw new BadRequestException(this.i18n.t('test.INVALID_REQUEST'));
    }
  }

  private async checkExistingUser(
    type: OtpType,
    verificationType: VerificationType,
    formattedPhone: string,
    email: string,
    userType: string,
  ): Promise<void> {
    const matchCondition: Record<string, any> = {
      isDeleted: false,
      type: userType,
    };

    if (verificationType === VerificationType.PHONE) {
      matchCondition.formattedPhone = formattedPhone;
      matchCondition.isPhoneVerified = true;
    } else {
      matchCondition.email = email;
      matchCondition.isEmailVerified = true;
    }
    const existingUser = await this.userRepository.findOne({
      where: matchCondition,
    });

    // if user found with this email and phone then return
    if (
      existingUser &&
      (type === OtpType.SIGN_UP ||
        type === OtpType.VERIFY_PHONE ||
        type === OtpType.VERIFY_EMAIL)
    ) {
      throw new BadRequestException(
        this.i18n.t(
          verificationType === VerificationType.PHONE
            ? 'test.AUTH.PHONE_ALREADY_EXISTS'
            : 'test.AUTH.EMAIL_ALREADY_EXISTS',
        ),
      );
    }

    // if user not found with this email and phone then return
    if (!existingUser && type === OtpType.FORGOT_PASSWORD) {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .where('user.type = :type', { type: userType })
        .andWhere('user.email = :email', { email: email })
        .getOne();
      if (user && !user?.isEmailVerified) {
        throw new BadRequestException(
          this.i18n.t('test.USER.EMAIL_NOT_VERIFIED_LOGIN'),
        );
      }

      throw new BadRequestException(this.i18n.t('test.USER.NOT_FOUND'));
    }
  }

  private async generateOtp(
    verificationType: VerificationType,
    formattedPhone: string,
    email: string,
    type: OtpType,
    userType: string,
  ): Promise<void> {
    const matchCondition: Record<string, any> = {
      type,
      userType,
    };

    // match with phone
    if (verificationType === VerificationType.PHONE) {
      matchCondition.formattedPhone = formattedPhone;
    } else {
      // match with email
      matchCondition.email = email;
    }

    let otp = await this.otpRepository.findOne({ where: matchCondition });

    if (!otp) {
      if(verificationType === VerificationType.PHONE){
        otp = this.otpRepository.create({
          formattedPhone,
          type,
          userType: UserType[userType],
        });
      }else{
        otp = this.otpRepository.create({
          email,
          type,
          userType: UserType[userType],
        });
      }  
    }

    otp.otp = generateOtp();
    otp.validTill = otpValidTill();
    otp.isVerified = false;
    await this.otpRepository.save(otp);
    //sent mail for otp (forgot pwd)
    const message = `Your verification code is: ${otp.otp} for Matchcreatorz. Please enter this code to verify your identity. The code is valid for 10 minutes.`;
    if (formattedPhone && formattedPhone != undefined && formattedPhone != 'undefined') {
      await this.fcmService.sendSMS(formattedPhone, message);

      //welcome mail sent
      if (
        type === OtpType.SIGN_UP &&
        verificationType === VerificationType.PHONE
      ) {
        const user = await this.userRepository
          .createQueryBuilder('user')
          .where('user.type = :type', { type: userType })
          .andWhere('user.formattedPhone = :formattedPhone', {
            formattedPhone: formattedPhone,
          })
          .getOne();
        if (user) {
          const futureTime = new Date(currentTime.getTime() + 20 * 60 * 1000); // 20 minute validate
          // hashing
          const validateString =
            (Math.random() + 1).toString(36).substring(12) +
            user.password?.substring(0, 12);
          user.resetToken = validateString;
          user['authTokenIssuedDateAt'] = new Date(futureTime.getTime());
          await this.userRepository.save(user);

          // send mail
          await this.mailService.sendMailToUserForWelComeMail(
            user,
            user.resetToken,
            otp.otp,
          );
        }
      }
    } else {
      await this.mailService.sendMailToUserForMailUpdate(otp, otp.otp);
    }
    //}
  }

  private async validateOtp(
    verificationType: VerificationType,
    formattedPhone: string,
    email: string,
    type: OtpType,
    otp: string,
    userType: string,
  ): Promise<void> {
    // match condition
    const matchCondition: Record<string, any> = {
      otp,
      type,
      userType,
      validTill: MoreThanOrEqual(new Date()),
      isVerified: false,
    };

    // match with phone
    if (verificationType === VerificationType.PHONE) {
      matchCondition.formattedPhone = formattedPhone;
    } else {
      // match with email
      matchCondition.email = email;
    }
    const otpData = await this.otpRepository.findOne({
      where: matchCondition,
    });

    console.log("otpData==>", otpData); 
   

    // check otp is valid or not
    if (!otpData) {
      throw new BadRequestException(this.i18n.t('test.OTP.INVALID'));
    }



    // mark otp verified
    otpData.isVerified = true;
    await this.otpRepository.save(otpData);
  }

  public async token(body: any, req: any): Promise<any> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id: body?.userId })
      .getOne();

    user.authTokenIssuedAt = utcDateTime().valueOf();
    await this.userRepository.save(user);

    const platform = req.headers['x-market-place-platform'];

    const payload = {
      sub: user.id,
      aud: platform,
      iat: user.authTokenIssuedAt,
    };
    const token = JwtUtility.generateToken(payload);
    // Delete password & authTokenIssuedAt
    ['password', 'authTokenIssuedAt'].forEach((key) => delete user[key]);
    return new ResponseSuccess(this.i18n.t('Token'), {
      token,
      user,
    });
  }

  public async resetPasswordURL(
    resetPasswordDto: ResetPasswordURLDto,
    resp: any,
  ): Promise<any> {
    const { validateString } = resetPasswordDto;

    console.log('validateString:::', validateString);

    const userValid = await this.userRepository.findOne({
      where: { resetToken: validateString, isDeleted: false },
    });

    let msg = `alert("Email Verified Successfully!")`;

    if (!userValid) {
      msg = `alert("User not found!")`;
    } else if (userValid.isSuspended) {
      msg = `alert("This account is suspended by admin!")`;
    } else if (
      userValid.authTokenIssuedDateAt &&
      userValid.authTokenIssuedDateAt < new Date()
    ) {
      msg = `alert("Token Expired!"")`;
    } else {
      userValid.resetToken = '';
      userValid.isEmailVerified = true;
      userValid.authTokenIssuedDateAt = new Date();
      await this.userRepository.save(userValid);
    }

    return resp.send(`
        <html>
        <head>
            <script>
                ${msg}
                window.location.href = 'https://matchcreatorz.com';
            </script>
        </head>
        <body></body>
        </html>
    `);
  }
}
