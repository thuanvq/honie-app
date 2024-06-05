import { Inject, Injectable } from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb';

@Injectable()
export class MongoDBService {
  private readonly dbName: string;

  constructor(@Inject('DATABASE_CONNECTION') private readonly mongoClient: MongoClient) {
    this.dbName = process.env.DATABASE_NAME;
  }

  getCollection(collectionName: string): Collection {
    return this.mongoClient.db(this.dbName).collection(collectionName);
  }
}
