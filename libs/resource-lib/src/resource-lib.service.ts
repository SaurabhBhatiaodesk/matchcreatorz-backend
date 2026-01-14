import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseSuccess } from 'common/dto';
import {
  Country,
  City,
  State,
  Category,
  PriceRange,
  ResponseTime,
  Tag,
  Banner,
  Testimonial,
  AdminSetting,
  Admin
} from 'common/models';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { BannerDto, TestimoialDto } from './dto';
import { AllBannerDto } from './dto/bannerListDto';

@Injectable()
export class ResourceLibService {
  constructor(
    @InjectRepository(Country) private resourceRepository: Repository<Country>,
    @InjectRepository(State) private stateRepository: Repository<State>,
    @InjectRepository(City) private cityRepository: Repository<City>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(PriceRange)
    private priceRangeRepository: Repository<PriceRange>,
    @InjectRepository(ResponseTime)
    private responseTimeRepository: Repository<ResponseTime>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
    @InjectRepository(Banner) private bannerRepository: Repository<Banner>,
    @InjectRepository(Testimonial) private testimonialRepository: Repository<Testimonial>,
    @InjectRepository(AdminSetting)
    private adminSettingRepository: Repository<AdminSetting>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private readonly i18n: I18nService,
  ) {}

  async getCountry(): Promise<any> {
    const countryData = await this.resourceRepository.find({
      order: {
        countryName: 'ASC',
      },
    });

    if (!countryData) {
      throw new BadRequestException(this.i18n.t('test.RESOURCES.NOT_FOUND'));
    }

    return new ResponseSuccess(this.i18n.t('test.RESOURCES.INFO'), {
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
      throw new BadRequestException(this.i18n.t('test.RESOURCES.NOT_FOUND'));
    }

    return new ResponseSuccess(this.i18n.t('test.RESOURCES.INFO'), {
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
      throw new BadRequestException(this.i18n.t('test.RESOURCES.NOT_FOUND'));
    }

    return new ResponseSuccess(this.i18n.t('test.RESOURCES.INFO'), {
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
      throw new BadRequestException(this.i18n.t('test.RESOURCES.NOT_FOUND'));
    }

    return new ResponseSuccess(this.i18n.t('test.RESOURCES.INFO'), {
      category: categoryData,
    });
  }

  async getPriceRange(): Promise<any> {
    const priceRangeData = await this.priceRangeRepository.find({
      where : {
        isDeleted : false,
        isSuspended : false
      },
    });

    return new ResponseSuccess(this.i18n.t('test.RESOURCES.LIST'), {
      priceRangeData,
    });
  }

  async getResponseTime(): Promise<any> {
    const responseTimeData = await this.responseTimeRepository.find({
      where : {
        isDeleted : false,
        isSuspended : false
      },
      order: {
        id: 'DESC',
      },
    });

    return new ResponseSuccess(this.i18n.t('test.RESOURCES.RESPONSE_TIME'), {
      responseTimeData,
    });
  }

  async getTag(category?: any): Promise<any> {
    const tagData = await this.tagRepository.find({
      where: category?.categoryId
        ? { category: { id: category.categoryId } }
        : {},
      relations: ['category'],
      order: {
        created: 'DESC',
      },
    });

    if (!tagData) {
      throw new BadRequestException(this.i18n.t('test.TAG.NOT_FOUND'));
    }

    return new ResponseSuccess(this.i18n.t('test.TAG.INFO'), {
      tag: tagData,
    });
  }

  async allBanner(params: AllBannerDto): Promise<any> {
    const { skip, limit } = params;
    const query = this.bannerRepository.createQueryBuilder('banner').select('*')
    .andWhere('banner.isDeleted = :isDeleted', { isDeleted : false });

    const totalRecords = await query.getCount();
    query.orderBy('created', 'DESC');
    const records = await query.getRawMany();

    const perPage = skip == 0 ? Number(skip) + 1 : Number(skip);
      query.skip((perPage - 1) * limit).take(limit)

    const response = {
      total: totalRecords,
      totalPage: Math.ceil(totalRecords / limit),
      totalRecords: records,
      page: Number(skip + 1),
    };

    return new ResponseSuccess('', response);
  }

  async banner(params: BannerDto): Promise<any> {
    const { url, image } = params;

    const banner = this.bannerRepository.create({
      url,
      image : image,
    });

    await this.bannerRepository.save(banner);

    return new ResponseSuccess(this.i18n.t('test.BANNER.ADDED'), {});
  }

  async deleteBanner(params: any): Promise<any> {
     const banner = await this.bannerRepository.findOne({
      where: { id: params },
    });

    if (!banner) {
      throw new BadRequestException(this.i18n.t('test.BANNER.NOT_FOUND'));
    }

    banner.isDeleted = true;
    await this.bannerRepository.save(banner);

    try {
      await this.bannerRepository.delete({ id: banner.id });
    } catch (error) {
      throw error;
    }
    
    return new ResponseSuccess(this.i18n.t('test.BANNER.DELETED'), {});
  }

  async allTestimonial(params: AllBannerDto): Promise<any> {
    const { skip, limit } = params;

    const query = this.testimonialRepository.createQueryBuilder('testimonial')
  .select('*')
  .where('testimonial.isDeleted = :isDeleted', { isDeleted: false });


    const totalRecords = await query.getCount();
    query.orderBy('created', 'DESC');
    const records = await query.getRawMany();

    const perPage = skip == 0 ? Number(skip) + 1 : Number(skip);
      query.skip((perPage - 1) * limit).take(limit)

    const response = {
      total: totalRecords,
      totalPage: Math.ceil(totalRecords / limit),
      totalRecords: records,
      page: Number(skip),
    };

    return new ResponseSuccess('', response);
  }

  async testimonial(params: TestimoialDto): Promise<any> {
    const { name, designation, avatar, totalRating, comment } = params;
    const testimoials = this.testimonialRepository.create({
      name,
      designation,
      avatar,
      totalRating : Number(totalRating),
      comment
    });

    await this.testimonialRepository.save(testimoials);

    return new ResponseSuccess(this.i18n.t('test.BANNER.TESTIMONIAL.ADDED'), {});
  }
  
  async deleteTestimonial(params: any): Promise<any> {
    const testimoials = await this.testimonialRepository.findOne({
      where: { id: params },
    });

    if (!testimoials) {
      throw new BadRequestException(this.i18n.t('test.BANNER.TESTIMONIAL.NOT_FOUND'));
    }

    testimoials.isDeleted = true;

    await this.testimonialRepository.save(testimoials)

    await this.testimonialRepository.delete({ id: params });

    return new ResponseSuccess(this.i18n.t('test.BANNER.TESTIMONIAL.DELETED'), {});
  }

  async getAdminSetting(): Promise<any> {
    const admin = await this.adminRepository.findOne({
      where: {
        isDeleted : false,
      },
      select : ['firstName', 'email', 'fullName', 'lastName', 'avatar', 'id']
    });
 
    const adminSetting = await this.adminSettingRepository.findOne({
      where: { isDeleted: false },
    });
    return new ResponseSuccess(this.i18n.t('test.RESOURCES.LIST'), {...adminSetting, ...admin, adminId: admin.id});
  }


}
