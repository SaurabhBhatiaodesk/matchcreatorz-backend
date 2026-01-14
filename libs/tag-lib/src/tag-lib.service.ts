import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { tagDto } from 'apps/user/src/modules/tags/dto/tagDto.dto';
import { ResponseSuccess } from 'common/dto';
import { Tag } from 'common/models';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
@Injectable()
export class TagLibService {
    constructor(
        @InjectRepository(Tag) private tagRepository: Repository<Tag>,
        private readonly i18n: I18nService,
      ) {}

      async getTag(category?: tagDto): Promise<any> {

          const tagData = await this.tagRepository.find({
            where: category?.categoryId ? { 
              category: { 
                id: category.categoryId, 
                isSuspended : false, 
                isDeleted : false
              },  
              isSuspended : false, isDeleted : false
            } : { 
              isSuspended : false, isDeleted : false,
              category: { isSuspended : false, isDeleted : false }
            },
            relations: ["category"],
            order: {
              created: "DESC",
            }
          });
    
          if (!tagData) {
            throw new BadRequestException(this.i18n.t('test.TAG.NOT_FOUND'));
          }
    
          return new ResponseSuccess(this.i18n.t('test.TAG.INFO'), {
            tag: tagData,
          });
      }
    
      async getById(id: number): Promise<any> {
        const tag = await this.getTagById(id);
    
        if (!tag) {
          throw new BadRequestException(this.i18n.t('test.TAG.NOT_FOUND'));
        }
    
        return new ResponseSuccess(this.i18n.t('test.TAG.INFO'), { tag });
      }
    
      async getTagById(id: number) {
        const tag = await this.tagRepository.findOne({
          where: {
            id,
          },
        });
        return tag;
      }
    
}
