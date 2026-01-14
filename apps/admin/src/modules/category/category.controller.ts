import { Controller, Delete, Get, Param, Query, Put, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders } from 'common/decorators';
import { CategoryLibService } from '@app/category-lib';
import { AllCategoryDto, AllTagDto, AddUpdateCategoryDto, AddUpdateTagDto } from '@app/category-lib/dto';

// Controller for handling category-related requests
@ApiTags('Category')
@Controller('category')
@CustomHeaders()
export class CategoryController {
  constructor(private readonly categoryLibService: CategoryLibService) {}

  // Endpoint to add or update a category
  @ApiOperation({ summary: 'Add or update a category' })
  @Put('add-edit')
  @ApiBearerAuth()
  async updateCategory(
    @Body() addUpdateCategoryDto: AddUpdateCategoryDto
  ) {
    return this.categoryLibService.addUpdateCategory(addUpdateCategoryDto);
  }

  // Endpoint to retrieve a list of all categories
  @ApiOperation({ summary: 'Retrieve a list of all categories' })
  @Get()
  @ApiBearerAuth()
  async list(@Query() allCategoryDto: AllCategoryDto) {
    return this.categoryLibService.all(allCategoryDto);
  }

  // Endpoint to delete a category by ID
  @ApiOperation({ summary: 'Delete a category by ID' })
  @Delete('delete/:id')
  @ApiBearerAuth()
  async deleteCategory(@Param('id') id: number) {
    return this.categoryLibService.delete(id);
  }

  // Endpoint to retrieve category details by ID
  @ApiOperation({ summary: 'Retrieve category details by ID' })
  @Get('details/:id')
  @ApiBearerAuth()
  async getDetails(@Param('id') id: number) {
    return this.categoryLibService.get(id);
  }

  // Endpoint to update the status of a category
  @ApiOperation({ summary: 'Update the status of a category' })
  @Get('update-status/:id')
  @ApiBearerAuth()
  async updateStatus(@Param('id') id: number) {
    return this.categoryLibService.updateStatus(id);
  }

  // Endpoint to add or update a tag
  @ApiOperation({ summary: 'Add or update a tag' })
  @Put('tags/add-edit')
  @ApiBearerAuth()
  async updateTags(
    @Body() addUpdateTagDto: AddUpdateTagDto
  ) {
    return this.categoryLibService.addUpdateTag(addUpdateTagDto);
  }

  // Endpoint to retrieve a list of all tags
  @ApiOperation({ summary: 'Retrieve a list of all tags' })
  @Get('tags')
  @ApiBearerAuth()
  async tagsList(@Query() allUserDto: AllTagDto) {
    return this.categoryLibService.allTag(allUserDto);
  }

  // Endpoint to delete a tag by ID
  @ApiOperation({ summary: 'Delete a tag by ID' })
  @Delete('tags/:id')
  @ApiBearerAuth()
  async deleteTags(@Param('id') id: number) {
    return this.categoryLibService.deleteTag(id);
  }

  // Endpoint to retrieve tag details by ID
  @ApiOperation({ summary: 'Retrieve tag details by ID' })
  @Get('tags/:id')
  @ApiBearerAuth()
  async getTags(@Param('id') id: number) {
    return this.categoryLibService.getTag(id);
  }

  // Endpoint to update the status of a tag
  @ApiOperation({ summary: 'Update the status of a tag' })
  @Get('tags/update-status/:id')
  @ApiBearerAuth()
  async tagsUpdateStatus(@Param('id') id: number) {
    return this.categoryLibService.updateStatusTag(id);
  }

  // Endpoint to retrieve a list of all tags
  @ApiOperation({ summary: 'Retrieve a list of all tags for seller filter' })
  @Get('tags-list')
  @ApiBearerAuth()
  async tagsForFilterList() {
    return this.categoryLibService.getTagForFilter();
  }
}
