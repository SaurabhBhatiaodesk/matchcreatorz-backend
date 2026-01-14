import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseSuccess } from 'common/dto';
import { AdminSetting, ResponseTime, PriceRange } from 'common/models';
import { I18nService } from 'nestjs-i18n';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { UpdateDto } from './dto';
import { AllDataDto } from './dto/responseTime.dto';
import { AddEditRTDto } from '@app/admin-setting-lib/dto/addEdit.dto';
import { BadRequestException } from '@nestjs/common';
import { AddEditPRDto } from './dto/addEditPR.dto';

@Injectable()
export class AdminSettingLibService {
  constructor(
    @InjectRepository(AdminSetting)
    private adminSettingRepository: Repository<AdminSetting>,
    @InjectRepository(ResponseTime)
    private adminResponseTimeRepository: Repository<ResponseTime>,
    @InjectRepository(PriceRange)
    private adminPriceRangeRepository: Repository<PriceRange>,
    private readonly i18n: I18nService,
  ) {}

  async get(): Promise<ResponseSuccess> {
    const adminSetting = await this.find();
    return new ResponseSuccess(this.i18n.t('test.ADMIN_SETTING.INFO'), {
      ...adminSetting,
    });
  }

  async update(updateDto: UpdateDto): Promise<any> {
    const adminSetting = await this.adminSettingRepository.findOne({
      where: { isDeleted: false },
    });
    adminSetting.androidAppVersion = updateDto.androidAppVersion;
    adminSetting.androidForceUpdate = updateDto.androidForceUpdate;
    adminSetting.iosAppVersion = updateDto.iosAppVersion;
    adminSetting.iosForceUpdate = updateDto.iosForceUpdate;
    adminSetting.websiteVersion = updateDto.websiteVersion;
    adminSetting.maintenanceMode = updateDto.maintenanceMode;
    adminSetting.cancellationPercentage = updateDto.cancellationPercentage;
    adminSetting.bookingPercentage = updateDto.bookingPercentage;
    adminSetting.bookingPercentageForPayment =
      updateDto.bookingPercentageForPayment;
    adminSetting.responseTime = updateDto.responseTime;
    adminSetting.priceRange = updateDto.priceRange;
    adminSetting.earningSellerCardVisibility =
      updateDto.earningSellerCardVisibility;
    adminSetting.earningBuyerCardVisibility =
      updateDto.earningBuyerCardVisibility;
      adminSetting.minPercentForSettle = updateDto.minPercentForSettle;
      adminSetting.platformFee =updateDto.platformFee;
    // save
    await this.adminSettingRepository.save(adminSetting);
    return new ResponseSuccess(this.i18n.t('test.ADMIN_SETTING.UPDATED'), {
      adminSetting,
    });
  }

  async find(): Promise<any> {
    let adminSetting = await this.adminSettingRepository.findOne({
      where: { id: 1 },
    });
    if (!adminSetting) {
      adminSetting = this.adminSettingRepository.create({});
      await this.adminSettingRepository.save(adminSetting);
    }
    return adminSetting;
  }

  async allResponseTime(allDataDto: AllDataDto): Promise<any> {
    const { pagination = true, skip, limit = 10 } = allDataDto;
    const query = this.adminResponseTimeRepository
      .createQueryBuilder('response_time')
      .select('*')
      .where('response_time.isDeleted = :isDeleted', { isDeleted: false });

    // total records
    const total = await query.getCount();

    // if pagination true
    if (pagination) {
      const perPage = skip == 0 ? Number(skip) + 1 : Number(skip) + 1;
      query.skip((perPage - 1) * limit).take(limit)
    }

    // get records
    const records = await query.getRawMany();

    const response = {
      total,
      totalPage: Math.ceil(total / limit),
      totalRecords: records,
      page: skip + 1,
    };

    return new ResponseSuccess('', response);
  }

  async allPriceRange(allDataDto: AllDataDto): Promise<any> {
    const { pagination = true, skip, limit = 10 } = allDataDto;

    const query = this.adminPriceRangeRepository
      .createQueryBuilder('price_range')
      .select('*')
      .where('price_range.isDeleted = :isDeleted', { isDeleted: false })

    // total records
    const total = await query.getCount();

    // if pagination true
    if (pagination) {
      const perPage = skip == 0 ? Number(skip) + 1 : Number(skip) + 1;
      query.skip((perPage - 1) * limit).take(limit)
    }

    // get records
    const records = await query.getRawMany();

    const response = {
      total,
      // records,
      totalPage: Math.ceil(total / limit),
      totalRecords: records,
      page: skip + 1,
    };

    return new ResponseSuccess('', response);
  }

  async addUpdateResponseTime(addUpdateDto: AddEditRTDto): Promise<any> {
    try {
      const { id, hours } = addUpdateDto;
      if (id) {
        const resp = await this.adminResponseTimeRepository
          .createQueryBuilder()
          .update(ResponseTime)
          .set({time : hours})
          .where('id = :id', { id })
          .execute();

        if (!resp) {
          throw new BadRequestException(
            this.i18n.t('test.ADMIN_SETTING.RESPONSE_TIME.NOT_FOUND'),
          );
        }

        return new ResponseSuccess(this.i18n.t('testt.ADMIN_SETTING.RESPONSE_TIME.UPDATED'), {
          resp,
        });
      } else {

        const create = {
          time: hours
        };

        const resp = this.adminResponseTimeRepository.create(create);
        await this.adminResponseTimeRepository.save(resp);

        return new ResponseSuccess(this.i18n.t('test.ADMIN_SETTING.RESPONSE_TIME.ADDED'), {
          resp,
        });

      }
    } catch (error) {
      return error;
    }
  }

  async addUpdatePriceRange(addUpdateDto: AddEditPRDto): Promise<any> {
    try {
      const { id, min, max } = addUpdateDto;
      if (id) {
        const user = await this.adminPriceRangeRepository
          .createQueryBuilder()
          .update(PriceRange)
          .set({
            min: min,
            max: max,
            minMaxVal: `$${min}-$${max}`
          })
          .where('id = :id', { id })
          .execute();

        if (!user) {
          throw new BadRequestException(
            this.i18n.t('test.ADMIN_SETTING.PRICE_RANGE.NOT_FOUND'),
          );
        }

        return new ResponseSuccess(this.i18n.t('test.ADMIN_SETTING.PRICE_RANGE.UPDATED'), {});
      } else {

        const condi = await this.adminPriceRangeRepository.findOne({
          where: {
            min: LessThan(Number(max)),
            max: MoreThan(Number(min)),
            isDeleted: false,
          },
        });

        if (condi) {
          if (min >= condi.min) {
            return new ResponseSuccess(this.i18n.t(`test.ADMIN_SETTING.PRICE_RANGE.MINPRICE_LESS${condi.min}`), {});
          }
        
          if (max <= condi.max) {
            return new ResponseSuccess(this.i18n.t(`test.ADMIN_SETTING.PRICE_RANGE.MINPRICE_LESS${condi.max}`), {});
          }
        }
      

        const create = {
          min: min,
          max: max,
          minMaxVal: `${min}-${max}`
        };

        const resp = this.adminPriceRangeRepository.create(create);
        await this.adminPriceRangeRepository.save(resp);

        return new ResponseSuccess(this.i18n.t('test.ADMIN_SETTING.PRICE_RANGE.ADDED'), {});
      }
    } catch (error) {
      return error;
    }
  }

  async deletePR(id: number): Promise<any> {
    const pr = await this.adminPriceRangeRepository.findOne({
      where: {
        id,
      },
    });

    if (!pr) {
      throw new BadRequestException(this.i18n.t('test.ADMIN_SETTING.PRICE_RANGE.NOT_FOUND'));
    }
    pr.isDeleted = true;
    await this.adminPriceRangeRepository.save(pr);

    return new ResponseSuccess(this.i18n.t('test.ADMIN_SETTING.PRICE_RANGE.DELETED'), {});
  }

  async deleteRT(id: number): Promise<any> {
    const rt = await this.adminResponseTimeRepository.findOne({
      where: {
        id,
      },
    });

    if (!rt) {
      throw new BadRequestException(this.i18n.t('test.ADMIN_SETTING.RESPONSE_TIME.NOT_FOUND'));
    }
    rt.isDeleted = true;
    await this.adminResponseTimeRepository.save(rt);

    return new ResponseSuccess(this.i18n.t('test.ADMIN_SETTING.RESPONSE_TIME.DELETED'), {});
  }
}
