import { Controller } from '@nestjs/common';

@Controller('viewer')
export class ViewerController {
  constructor() {}

  // @Get('get-collections')
  // async getCollections() {
  //   return await this.mongodbService.listCollections();
  // }

  // @Post('query-collection')
  // async queryCollection(@Body() body: any) {
  //   const { collection, condition, projection, sort, skip, limit } = body;
  //   const data = await this.mongodbService.fetchData(
  //     collection,
  //     condition,
  //     projection,
  //     sort,
  //     skip,
  //     limit,
  //   );
  //   const total = await this.mongodbService.countDocuments(
  //     collection,
  //     condition,
  //   );
  //   return { data, total };
  // }
}
