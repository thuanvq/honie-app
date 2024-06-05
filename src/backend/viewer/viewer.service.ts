import { Injectable } from '@nestjs/common';

@Injectable()
export class ViewerService {
  // constructor(private readonly mongodbService: MongoDBService) {}

  async getCollections() {
    // return this.mongodbService.listCollections();
  }

  async queryCollection(
    collection: string,
    condition: object,
    projection: object,
    sort: Record<string, 1 | -1>, // Ensure sort is typed correctly
    skip: number,
    limit: number,
  ) {
    // return this.mongodbService.fetchData(collection, condition, projection, sort, skip, limit);
  }
}
