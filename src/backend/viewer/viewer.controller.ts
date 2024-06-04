import { Controller, Get, Post, Body } from '@nestjs/common';
import { MongodbService } from '../mongodb/mongodb.service';

@Controller('viewer')
export class ViewerController {
  constructor(private readonly mongodbService: MongodbService) {}

  @Get('get-collections')
  async getCollections() {
    return await this.mongodbService.listCollections();
  }

  @Post('query-collection')
  async queryCollection(@Body() body: any) {
    const { collection, condition, projection, sort, skip, limit } = body;
    const data = await this.mongodbService.fetchData(
      collection,
      condition,
      projection,
      sort,
      skip,
      limit,
    );
    const total = await this.mongodbService.countDocuments(
      collection,
      condition,
    );
    return { data, total };
  }
}
