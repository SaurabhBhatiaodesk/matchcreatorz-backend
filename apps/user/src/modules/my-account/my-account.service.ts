import { BadRequestException, Injectable } from '@nestjs/common';
import { MoreThanOrEqual, Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp, User, UserTag, UserFaq, Tag, UserPortfolio, Category, SocialAccount } from 'common/models';
import { ResponseSuccess } from 'common/dto';
import { OtpType, ProfileStatus } from 'common/enums';
import { comparePassword, generateOtp, hashPassword, otpValidTill, utcDateTime } from 'common/utils';
import { I18nService } from 'nestjs-i18n';
import { MailService } from '../../mail/mail.service';
import {
  ChangePasswordDto,
  UpdateAvatarDto,
  UpdateLanguageDto,
  UpdateProfileDto,
  UpdateFAQDto,
  UpdatePortfolioDto,
  UpdateContactInfoDto
} from './dto';
@Injectable()
export class MyAccountService {
  constructor(
    private readonly mailService: MailService,
    @InjectRepository(Category) private categoryRepository: Repository<Category>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserTag) private userTagRepository: Repository<UserTag>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
    @InjectRepository(UserFaq) private userFAQRepository: Repository<UserFaq>,
    @InjectRepository(Otp) private otpRepository: Repository<Otp>,
    @InjectRepository(UserPortfolio) private userPortfolioRepository: Repository<UserPortfolio>,
    @InjectRepository(SocialAccount)
        private socialAccountRepository: Repository<SocialAccount>,
    private readonly i18n: I18nService,
  ) {}

  async profile(req: any): Promise<any> {
    const { user } = req;
    const userData = await this.userRepository
    .createQueryBuilder('user') 
    .leftJoinAndSelect('user.country','country')
    .leftJoinAndSelect('user.state','state')
    .leftJoinAndSelect('user.category','category')
    .where({
      id: user.id,
    })
    .getOne();

    if (!userData) {
      throw new BadRequestException(this.i18n.t('test.USER.NOT_FOUND'));
    }

    ['password', 'authTokenIssuedAt'].forEach(
      key => delete userData[key]
    );
   
    const tagData = await this.userTagRepository
      .createQueryBuilder('user_tag')
      .select(["tag.id", "tag.name" ])
      .leftJoin('tag', 'tag', 'user_tag.tagId = tag.id')
      .where('user_tag.userId = :userId', { userId: user.id })
      .orderBy('tag.id').getRawMany();

    // For FAQ & Portfolio  
    const userType= req.headers['user-type'];
    if(userType === 'SELLER'){
        const portfolioData = await this.userPortfolioRepository.find({
          where: {
            userId: user.id,
          },
          order: {
            created: "DESC",
          }
        }); 

        const faqData = await this.userFAQRepository.find({
          where: {
            userId:user.id,
          },
          order: {
            created: "DESC",
          }
        });
        const usersAllData = {
          ...userData,
          tags : tagData,
          faqs:faqData,
          portfolios:portfolioData
        }
        return new ResponseSuccess('PROFILE', { user: usersAllData });
    }  
  
    const usersAllData = {
      ...userData,
      tags : tagData
    }
    return new ResponseSuccess('PROFILE', { user: usersAllData });
  }

  async otherProfile(id: number): Promise<any> {
    const userData = await this.userRepository
    .createQueryBuilder('user') 
    .leftJoinAndSelect('user.country','country')
    .leftJoinAndSelect('user.state','state')
    .leftJoinAndSelect('user.category','category')
    .where({
      id: id,
    })
    .getOne();

    if (!userData) {
      throw new BadRequestException(this.i18n.t('test.USER.NOT_FOUND'));
    }
    ['password', 'authTokenIssuedAt'].forEach(
      key => delete userData[key]
    );
   
    const tagData = await this.userTagRepository
      .createQueryBuilder('user_tag')
      .select(["tag.id", "tag.name" ])
      .leftJoin('tag', 'tag', 'user_tag.tagId = tag.id')
      .where('user_tag.userId = :userId', { userId: id })
      .orderBy('tag.id').getRawMany();
    const usersAllData = {
      ...userData,
      tags : tagData
    }
    return new ResponseSuccess('PROFILE', 
    {
      user: this.omittedUser(usersAllData),
    });
  }

  async updateProfile(
    updateProfileDto: UpdateProfileDto,
    req: any,
  ): Promise<any> {
    const { user } = req;
    const {
      address,
      fullName,
      gender,
      countryCode,
      phone,
      email,
      priceRange,
      dob,
      countryId,
      stateId,
      city,
      zipcode,
      categoryId,
      bio,
      banner,
      resumeName,
      resume,
      tagId,
      responseTime,
    } = updateProfileDto;


    const userType= req.headers['user-type'];

    const formattedPhone = `${countryCode}${phone}`;

    // if user email that stored in database and new email are  not equal then check email verified or not
    if (user.email !== email && email && email != '') {
      const otp = await this.otpRepository.findOne({
        where: {
          type: OtpType.VERIFY_EMAIL,
          userType,
          email,
          validTill: MoreThanOrEqual(utcDateTime()),
        },
      });

      if (otp && !otp.isVerified) {
        throw new BadRequestException(
          this.i18n.t('test.AUTH.EMAIL_NOT_VERIFIED'),
        );
      }
      // update email
      user.email = email;
    }

    // if user phone that stored in database and new phone are not equal then check phone verified or not
    if (user.formattedPhone !== formattedPhone && phone && countryCode) {
      const otp = await this.otpRepository.findOne({
        where: {
          type: OtpType.VERIFY_PHONE,
          userType,
          formattedPhone,
          validTill: MoreThanOrEqual(utcDateTime()),
        },
      });

      if (!otp || (otp && !otp.isVerified)) {
        throw new BadRequestException(
          this.i18n.t('test.AUTH.PHONE_NOT_VERIFIED'),
        );
      }
      user.countryCode = countryCode;
      user.phone = phone;
      user.formattedPhone = formattedPhone;
    }
    if(user.step < 2){
      user.step = 2;
    }
    user.fullName = fullName;
    if(priceRange){
      user.priceRange = priceRange;
      const [minPrice, maxPrice] = priceRange.split('-').map(Number);
      if(minPrice){
        user.minPrice = minPrice;
      }
      if(maxPrice){
        user.maxPrice = maxPrice;
      }
    }
    user.gender = gender;
    user.dob = dob;
    user.zipcode = zipcode;
    user.bio = bio;
    if(banner){
      user.banner = banner;
    }
    user.resume = resume;
    user.resumeName = resumeName;
    user.responseTime = responseTime;
    user.address = address;
    if(countryId){
       user.countryId = countryId;
    }

    if(stateId){
      user.stateId = stateId;
    }
    
    if(city){
      user.city = city;
    }
    
    if(categoryId && tagId.length > 0){
        const categoryData = await this.categoryRepository.findOne({
          where: {
            id: categoryId,
          }
        });
        user.category = categoryData;

      const tagsData = await this.tagRepository.find({
        where: {
          id: In(tagId),
        },
        order: {
          created: "DESC",
        }
      });
      const userTagData = await this.userTagRepository.find({
        where: {
          userId: user.id,
        },
        order: {
          id: "DESC",
        }
      });

      if(userTagData.length){
        const result = await this.userTagRepository.delete({userId: user.id});
        if (result.affected) {
          tagsData.map(async (tag) => {
            const userTag = new UserTag();
            userTag.user = user;
            userTag.category = categoryData;
            userTag.tag = tag
            await this.userTagRepository.save(userTag);
          })
        }
      }else{
        tagsData.map(async (tag) => {
          const userTag = new UserTag();
          userTag.user = user;
          userTag.category = categoryData;
          userTag.tag = tag
          await this.userTagRepository.save(userTag);
        })
      }
    }else{
      await this.userTagRepository.delete({userId: user.id});
    }

        
    // If account rejected
    if(user?.profileStatus &&  user.profileStatus === ProfileStatus.REJECTED){
      user.profileStatus = ProfileStatus.PENDING;
    }
    await this.userRepository.save(user);
    return new ResponseSuccess(this.i18n.t('test.USER.PROFILE_UPDATED'));
  }

  async getFaq(req: any): Promise<any> {
    const { user } = req;
    const faqData = await this.userFAQRepository.find({
      where: {
        userId: user.id,
      },
      order: {
        created: "DESC",
      }
    });

    if (!faqData) {
      throw new BadRequestException(this.i18n.t('test.FAQ.NOT_FOUND'));
    }
    return new ResponseSuccess(this.i18n.t('test.FAQ.GET'), { faq: faqData });
  }

  async getPortfolio(req: any): Promise<any> {
    const { user } = req;
    const portfolioData = await this.userPortfolioRepository.find({
      where: {
        userId: user.id,
      },
      order: {
        created: "DESC",
      }
    });

    if (!portfolioData) {
      throw new BadRequestException(this.i18n.t('test.PORTFOLIO.NOT_FOUND'));
    }
    return new ResponseSuccess(this.i18n.t('test.FAQ.GET'), { portfolio: portfolioData });
  }

  async updateFAQ(updateFAQDto: UpdateFAQDto, req: any): Promise<any> {
    const { user } = req;
    const { question, answer, id } = updateFAQDto;

    if (id) {
      let faqData = await this.userFAQRepository.findOne({
        where: {
          id,
          userId: user.id,
        },
      });

      if (!faqData) {
        throw new BadRequestException(this.i18n.t('test.FAQ.NOT_FOUND'));
      }

      // Update existing FAQ
      faqData.question = question;
      faqData.answer = answer;
      faqData = await this.userFAQRepository.save(faqData);

      // If account rejected
      if(user && user.profileStatus === ProfileStatus.REJECTED){
        user.profileStatus = ProfileStatus.PENDING;
        await this.userRepository.save(user);
      }
      return new ResponseSuccess(this.i18n.t('test.USER.FAQ_UPDATED'), faqData);
    } else {
      // Create new FAQ
      const newFAQ = this.userFAQRepository.create({
        userId: user.id,
        user: user,
        question,
        answer,
      });

      await this.userFAQRepository.save(newFAQ);
      if(user.step < 3){
        user.step = 3;
      }
      await this.userRepository.save(user);
      delete newFAQ.user;
      return new ResponseSuccess(this.i18n.t('test.USER.FAQ_CREATED'), newFAQ);
    }
  }

  async deleteFAQ(id: number, req: any): Promise<any> {
    const { user } = req;
    // validate faq
    const faq = await this.userFAQRepository.findOne({
      where: {
        id,
        userId: user.id,
        isDeleted: false,
      },
    });
    if (!faq) {
      throw new BadRequestException(this.i18n.t('test.USER.FAQ_NOT_FOUND'));
    }
  
    // Delete Record
    const result = await this.userFAQRepository.delete(id);
    if (result.affected === 0) {
      throw new BadRequestException(this.i18n.t('test.USER.FAQ_NOT_FOUND'));
    }
    return new ResponseSuccess(this.i18n.t('test.USER.FAQ_DELETED'));
  }

  async updatePortfolio(updatePortfolioDto: UpdatePortfolioDto, req: any): Promise<any> {
    const { user } = req;
    const { title, image, id } = updatePortfolioDto;

    if (id) {
      const prtfolioData = await this.userPortfolioRepository.findOne({
        where: {
          id,
          user: user.id,
        },
      });

      if (!prtfolioData) {
        throw new BadRequestException(this.i18n.t('test.PORTFOLIO.NOT_FOUND'));
      }

      prtfolioData.title = title;
      prtfolioData.image = image;
      await this.userPortfolioRepository.save(prtfolioData);
      // If account rejected
      if(user && user.profileStatus === ProfileStatus.REJECTED){
        user.profileStatus = ProfileStatus.PENDING;
        await this.userRepository.save(user);
      }
      return new ResponseSuccess(this.i18n.t('test.USER.PORTFOLIO_UPDATED'), prtfolioData);
    } else {
      // Create new FAQ
      const userPortfolio = this.userPortfolioRepository.create({
        user: user,
        userId:user.id,
        title,
        image,
      });

      await this.userPortfolioRepository.save(userPortfolio);
      if(user.step < 4){
         user.step = 4;
      }
      await this.userRepository.save(user);
      // delete user
      delete userPortfolio.user;
      return new ResponseSuccess(this.i18n.t('test.USER.PORTFOLIO_CREATED'), userPortfolio);
    }

  }

  async deletePortfolio(id: number, req: any): Promise<any> {
    const { user } = req;
    // validate portfolio
    const portfolio = await this.userPortfolioRepository.findOne({
      where: {
        id,
        userId: user.id,
        isDeleted: false,
      },
    });
    if (!portfolio) {
      throw new BadRequestException(this.i18n.t('test.PORTFOLIO.NOT_FOUND'));
    }
  
    // Delete Record
    const result = await this.userPortfolioRepository.delete(id);
    if (result.affected === 0) {
      throw new BadRequestException(this.i18n.t('test.PORTFOLIO.NOT_FOUND'));
    }
    return new ResponseSuccess(this.i18n.t('test.PORTFOLIO.DELETED'));
  }

  async updateAvatar(updateAvatarDto: UpdateAvatarDto, req: any): Promise<any> {
    const { user } = req;
    const { avatar } = updateAvatarDto;

    user.avatar = avatar;
    await this.userRepository.save(user);
    return new ResponseSuccess(this.i18n.t('test.USER.AVATAR_UPDATED'));
  }

  async updateLanguage(
    updateLanguageDto: UpdateLanguageDto,
    req: any,
  ): Promise<any> {
    const { user } = req;
    const { language } = updateLanguageDto;

    user.language = language;
    await this.userRepository.save(user);
    return new ResponseSuccess(this.i18n.t('test.USER.LANGUAGE_UPDATED'),);
  }

  async notificationToggle(req: any): Promise<any> {
    const { user } = req;
    user.pushNotificationAllowed = !user.pushNotificationAllowed;
    await this.userRepository.save(user);
    return new ResponseSuccess(
      this.i18n.t('test.NOTIFICATION.STATUS_UPDATED')
    );
  }

  async deleteAccount(req: any): Promise<any> {
    const { user } = req;

    user.isDeleted = true;
    user.authTokenIssuedAt = null;
    user.deviceToken = null;
    user.phone = 'Anonymous';
    user.formattedPhone = 'Anonymous';
    user.email = 'Anonymous';
    user.isPhoneVerified = false;
    user.isEmailVerified = false;
    await this.userRepository.save(user);

    //Delete Social Account
    await this.socialAccountRepository.delete({ user: {id: user.id}});

    return new ResponseSuccess(this.i18n.t('test.USER.ACCOUNT_DELETED'));
  }

  public async changePassword(
    changePasswordDto: ChangePasswordDto,
    req: any,
  ): Promise<any> {
    const { user } = req;
    const { currentPassword, newPassword } = changePasswordDto;

    // match current password
    const passwordMatched = await comparePassword(
      currentPassword,
      user.password,
    );
    if (!passwordMatched) {
      throw new BadRequestException(
        this.i18n.t('test.USER.INVALID_CURRENT_PASSWORD'),
      );
    }

    user.password = await hashPassword(newPassword);
    await this.userRepository.save(user);
    return new ResponseSuccess(this.i18n.t('test.USER.PASSWORD_CHANGED'), {
      user: this.omittedUser(user),
    });
  }

  public async logout(req: any): Promise<any> {
    const { user } = req;

    user.authTokenIssuedAt = null;
    user.deviceToken = null;
    await this.userRepository.save(user);
    return new ResponseSuccess(this.i18n.t('test.AUTH.LOGOUT'));
  }

  async updateContact(
    updateContactDto: UpdateContactInfoDto,
    req: any,
  ): Promise<any> {
    const { user } = req;
    const { countryCode, phone, email } = updateContactDto;
    const userType = req.headers['user-type'];
    const formattedPhone = `${countryCode}${phone}`;

    let matchQuery = {}

    if (user?.formattedPhone === formattedPhone && user?.isPhoneVerified && user?.email === email && user?.isEmailVerified) {
        return new ResponseSuccess(this.i18n.t('test.USER.PROFILE_UPDATED'), { otpSent : false});
    }

    if(email){
      matchQuery = { email : email, isEmailVerified: true, isDeleted: false }
    }else{
      matchQuery = { formattedPhone, isPhoneVerified: true, isDeleted: false }
    } 

    const existingContact = await this.userRepository.findOne({
      where: matchQuery
    });
   

    if (existingContact) {
      if (formattedPhone && existingContact.formattedPhone === formattedPhone) {
        throw new BadRequestException(
          this.i18n.t('Phone number already registered'),
        );
      }
      if (email && existingContact.email === email) {
        throw new BadRequestException(
          this.i18n.t('Email already registered'),
        );
      }
    }    

   
    // Function to handle OTP creation and update
    const handleOtp = async (identifier: string, type: OtpType) => {
      let otp = await this.otpRepository.findOne({ where: { [type === OtpType.UPDATE_EMAIL ? 'email' : 'formattedPhone']: identifier } });
  
      if (!otp) {
        otp = this.otpRepository.create({
          [type === OtpType.UPDATE_EMAIL ? 'email' : 'formattedPhone']: identifier,
          type,
          userType,
        });
      }
      otp.type = type;
      otp.otp = generateOtp();
      otp.validTill = otpValidTill();
      otp.isVerified = false;
      await this.otpRepository.save(otp);
      return otp.otp;
    };

    
    // Check and handle email update
    if (email && !existingContact) {
      const otp = await handleOtp(email, OtpType.UPDATE_EMAIL);

      user.tempEmail = email;

      await this.userRepository.save(user);

      //send mail 
      const mailRes = await this.mailService.sendMailToUserForMailUpdateCheck(user, otp);
     // console.log('mailRes:::::::::::::', mailRes);
  
      return new ResponseSuccess(this.i18n.t('test.OTP.SENT'), { otpSent : true});
    }
  
    // Check and handle phone update
    if (formattedPhone && phone && countryCode && !existingContact) {
      await handleOtp(formattedPhone, OtpType.UPDATE_PHONE);
      user.tempFormattedPhone = formattedPhone;
      user.tempCountryCode = countryCode;
      user.tempPhone = phone;

      await this.userRepository.save(user);

      return new ResponseSuccess(this.i18n.t('test.OTP.SENT'), { otpSent : true});
    }
  
    return new ResponseSuccess(this.i18n.t('test.USER.PROFILE_UPDATED'), { otpSent : false});
  }
  

  private omittedUser(
    user: User,
  ): Omit<User, 'password' | 'authTokenIssuedAt'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, authTokenIssuedAt, ...rest } = user;
    return rest;
  }
}
