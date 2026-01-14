import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseSuccess } from 'common/dto';
import { Page } from 'common/models';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { AllPageDto, UpdatePageDto } from './dto';

@Injectable()
export class PageLibService {
  constructor(
    @InjectRepository(Page) private pageRepository: Repository<Page>,
    private readonly i18n: I18nService,
  ) {}
  async list(allPageDto: AllPageDto): Promise<any> {
    const {
      skip = 0,
      limit = 10,
    } = allPageDto;

    const query = this.pageRepository.createQueryBuilder().select('*');

    // total records
    const total = await query.getCount();

    const perPage = skip == 0 ? Number(skip) + 1 : Number(skip) + 1;
    query.skip((perPage - 1) * limit).take(limit)
   
    // get records
    const records = await query.getRawMany();

    const response = {
      total,
      records,
      totalRecords:records,
      totalPage: total,
      page: skip
    };

    return new ResponseSuccess('', response);
  }

  async getById(id: number): Promise<any> {
    const page = await this.getPageById(id);

    if (!page) {
      throw new BadRequestException(this.i18n.t('test.PAGE.NOT_FOUND'));
    }

    return new ResponseSuccess(this.i18n.t('test.PAGE.INFO'), { page });
  }

  async update(updatePageDto: UpdatePageDto): Promise<any> {
    const { title, description, id } = updatePageDto;
  
    // Fetch the page by ID
    const page = await this.getPageById(id);
  
    // Check if the page exists
    if (!page) {
      throw new BadRequestException(this.i18n.t('test.PAGE.NOT_FOUND'));
    }
  
    // Update the title and description only if they are provided in DTO
    if (title) page.title = title;
    if (description) page.description = description;
  
    // Save the updated page
    await this.pageRepository.save(page);
  
    // Return a success response with updated page info
    return new ResponseSuccess(this.i18n.t('test.PAGE.UPDATED'), { page });
  }
  
  async getPageById(id: number) {
    const page = await this.pageRepository.findOne({
      where: {
        id,
      },
    });
    return page;
  }

  async getBySlug(slug: string): Promise<Page> {
    return await this.pageRepository.findOne({ where: { slug } });
  }
}
