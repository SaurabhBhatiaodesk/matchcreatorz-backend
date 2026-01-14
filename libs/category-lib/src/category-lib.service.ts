import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseSuccess } from 'common/dto';
import { Category, Tag } from 'common/models';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { AllCategoryDto, LisCategoryDto, AllTagDto, AddUpdateCategoryDto, AddUpdateTagDto } from './dto';

@Injectable()
export class CategoryLibService {
  constructor(
    @InjectRepository(Category) private categoryRepository: Repository<Category>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
    private readonly i18n: I18nService,
  ) {}

  async addUpdateCategory(
    addUpdateCategoryDto: AddUpdateCategoryDto
  ): Promise<any> {
    const { title, id } = addUpdateCategoryDto;
    if (id) {
      const category = await this.categoryRepository.findOne({
        where: {
          id,
        },
      });

      if (!category) {
        throw new BadRequestException(
          this.i18n.t('test.CATEGORY.NOT_FOUND'),
        );
      }
      category.title = title;
      await this.categoryRepository.save(category);

      return new ResponseSuccess(this.i18n.t('test.CATEGORY.UPDATED'), {
        ...category,
      });
    }else{
      const category = new Category();
      category.title = title
      await this.categoryRepository.save(category);

      return new ResponseSuccess(this.i18n.t('test.CATEGORY.ADDED'), {
        ...category,
      });
    }
  }

  async list(listCategoryDto: LisCategoryDto): Promise<any> {
    const {
      pagination = true,
      skip = 0,
      limit = 10,
      searchTerm = '',
    } = listCategoryDto;


    let query = this.categoryRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.fullName',
        'user.avatar',
        'user.totalRating',
        'user.avgRating',
        'ta.id',
        'ta.name'
      ])
      .leftJoin('user_tag', 'ut', 'ut.userId = user.id')
      .leftJoin('tag', 'ta', 'ut.tagId = ta.id')
      .where('user.isSuspended = :isSuspended', { isSuspended: false })
      .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('user.isPhoneVerified = :isPhoneVerified', { isPhoneVerified: true })
      .andWhere('user.type = :type', { type: 'SELLER' })
      .groupBy('user.id')
      .addGroupBy('ta.id')
      .addGroupBy('ta.name');

    // if search term not empty then apply search
    if (searchTerm) {
      query = query.andWhere(`fullName LIKE :searchTerm`, {
        searchTerm: `%${searchTerm}%`,
      });
    }
    // get count
    const total = await query.getCount();

    // if pagination then add skip and limit
    if (pagination) {
      query.skip((skip - 1) * limit).take(limit)
    }

    // get records
    const records = await query.getRawMany();

    const response = {
      total,
      records,
      totalPage : Math.ceil(total / limit),
      totalRecords : records,
      page : (skip + 1)
    };

    return new ResponseSuccess('', response);
  }

  async all(allCategoryDto: AllCategoryDto): Promise<any> {
    const {
      pagination = true,
      skip,
      limit = 10,
      searchTerm = '',
      sortBy = 'id',
      sortDirection = 'DESC',
      activeStatus = 'ALL',
    } = allCategoryDto;

    const query = this.categoryRepository
    .createQueryBuilder()
    .select('*')
    .where('isDeleted = :isDeleted', {
      isDeleted: false
    });
 

    // search filter
    if (searchTerm) {
      query.andWhere(
        'title like :searchTerm',
        { searchTerm: `%${searchTerm}%` },
      );
    }
    // check active status
    if (activeStatus === 'ACTIVE') {
      query.andWhere('isSuspended = false');
    } else if (activeStatus === 'IN_ACTIVE') {
      query.andWhere('isSuspended = true');
    }

    // order by
    query.orderBy(sortBy, sortDirection);

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
      records,
      totalPage : Math.ceil(total / limit),
      totalRecords : records,
      page : skip + 1
    };

    return new ResponseSuccess('', response);
  }

  async delete(id: number): Promise<any> {
    const categoryData = await this.categoryRepository.findOne({
      where: {
        id,
      },
    });

    if (!categoryData) {
      throw new BadRequestException(this.i18n.t('test.CATEGORY.NOT_FOUND'));
    }
    categoryData.isDeleted = true;
    await this.categoryRepository.save(categoryData);

    return new ResponseSuccess(this.i18n.t('test.CATEGORY.DELETED'), {
      record: categoryData,
    });
  }

  async get(id: number): Promise<any> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new BadRequestException(this.i18n.t('test.CATEGORY.NOT_FOUND'));
    }

    return new ResponseSuccess(this.i18n.t('test.CATEGORY.INFO'), {
      ...category,
    });
  }

  async updateStatus(id: number): Promise<any> {
    const categoryData = await this.categoryRepository.findOne({
      where: {
        id,
      },
    });

    if (!categoryData) {
      throw new BadRequestException(this.i18n.t('test.CATEGORY.NOT_FOUND'));
    }
    categoryData.isSuspended = !categoryData.isSuspended;
    await this.categoryRepository.save(categoryData);

    return new ResponseSuccess(this.i18n.t('test.CATEGORY.STATUS_UPDATED'), {
      record: categoryData,
    });
  }

  async getUser(id: number): Promise<any> {
    const user = await this.validateActiveUserById(id);
    return new ResponseSuccess(this.i18n.t('test.CATEGORY.INFO'), { user });
  }

  async getUserById(id: number) {
    const category = await this.categoryRepository.findOne({
      where: {
        id,
        isDeleted: false,
      },
    });
    return category;
  }

  async validateActiveUserById(id: number) {
    const user = await this.getUserById(id);
    if (!user) {
      throw new BadRequestException(this.i18n.t('test.CATEGORY.NOT_FOUND'));
    }

    if (user.isSuspended) {
      throw new BadRequestException(this.i18n.t('test.CATEGORY.SUSPENDED'));
    }

    return user;
  }

  // Tags

  async addUpdateTag(
    addUpdateTagDto: AddUpdateTagDto
  ): Promise<any> {
    const { name, categoryId, id } = addUpdateTagDto;
    if (id) {
      const tag = await this.tagRepository.findOne({
        where: {
          id,
        },
      });

      if (!tag) {
        throw new BadRequestException(
          this.i18n.t('test.TAG.NOT_FOUND'),
        );
      }
      tag.name = name;
      await this.tagRepository.save(tag);

      return new ResponseSuccess(this.i18n.t('test.TAG.UPDATED'), {
        tag,
      });
    }else{
      const tag = new Tag();
      const category = await this.categoryRepository.findOne({
        where: {
          id : categoryId,
        },
      });

      if (!tag) {
        throw new BadRequestException(
          this.i18n.t('test.TAG.NOT_FOUND'),
        );
      }
      tag.name = name;
      tag.category = category;
      await this.tagRepository.save(tag);

      return new ResponseSuccess(this.i18n.t('test.TAG.ADDED'), {
        tag,
      });
    }
  }

  async allTag(allCategoryDto: AllTagDto): Promise<any> {
    const {
      pagination = true,
      skip = 0,
      limit = 10,
      searchTerm = '',
      sortBy = 'id',
      sortDirection = 'DESC',
      activeStatus = 'ALL',
      categoryId
    } = allCategoryDto;

    const query = this.tagRepository
      .createQueryBuilder('tag')
      .select('*')

      if(categoryId){
        query.andWhere('categoryId = :categoryId', {
          categoryId
        });
      }

    // search filter
    if (searchTerm) {
      query.andWhere(
        'title like :searchTerm',
        { searchTerm: `%${searchTerm}%` },
      );
    }
    // check active status
    if (activeStatus === 'ACTIVE') {
      query.andWhere('isSuspended = false');
    } else if (activeStatus === 'IN_ACTIVE') {
      query.andWhere('isSuspended = true');
    }

    // order by
    query.orderBy(sortBy, sortDirection);

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
      records,
    };

    return new ResponseSuccess('', response);
  }

  async deleteTag(id: number): Promise<any> {
    const tagData = await this.tagRepository.findOne({
      where: {
        id,
      },
    });

    if (!tagData) {
      throw new BadRequestException(this.i18n.t('test.TAG.NOT_FOUND'));
    }
    tagData.isDeleted = true;
    await this.tagRepository.save(tagData);

    return new ResponseSuccess(this.i18n.t('test.TAG.DELETED'), {
      record: tagData,
    });
  }

  async getTag(id: number): Promise<any> {
    const tagData = await this.tagRepository.findOne({
      where: { id },
    });

    if (!tagData) {
      throw new BadRequestException(this.i18n.t('test.TAG.NOT_FOUND'));
    }

    return new ResponseSuccess(this.i18n.t('test.TAG.INFO'), {
      ...tagData,
    });
  }

  async updateStatusTag(id: number): Promise<any> {

    const tagData = await this.tagRepository.findOne({
      where: {
        id,
      },
    });

    if (!tagData) {
      throw new BadRequestException(this.i18n.t('test.TAG.NOT_FOUND'));
    }
    tagData.isSuspended = !tagData.isSuspended;
    await this.tagRepository.save(tagData);

    return new ResponseSuccess(this.i18n.t('test.TAG.STATUS_UPDATED'), {
      record: tagData,
    });
  }

  async getTagForFilter(): Promise<any> {

    const tagData = await this.tagRepository.find({
      where: { 
        category: {  
          isSuspended : false, 
          isDeleted : false
        },  
        isSuspended : false, isDeleted : false
      },
      relations: ["category"],
      order: {
        created: "DESC",
      }
    });

    if (!tagData) {
      throw new BadRequestException(this.i18n.t('test.TAG.NOT_FOUND'));
    }

    const response = {
      total : tagData.length,
      records : tagData,
    };

    return new ResponseSuccess('', response);
}
}
