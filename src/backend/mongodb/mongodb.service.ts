import { Injectable, OnModuleInit } from '@nestjs/common';
import { MongoClient, Db, Collection, Document } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class MongodbService implements OnModuleInit {
  private client!: MongoClient; // Using definite assignment assertion
  private db!: Db; // Using definite assignment assertion

  async onModuleInit() {
    const url = process.env.DATABASE_URL || 'mongodb://localhost:27017';
    const dbName = process.env.DATABASE_NAME || 'defaultDb';

    this.client = new MongoClient(url, {});
    await this.client.connect();
    this.db = this.client.db(dbName);
  }

  getCollection<T extends Document>(collectionName: string): Collection<T> {
    return this.db.collection<T>(collectionName);
  }

  async fetchData(
    collectionName: string,
    condition: object,
    projection: object,
    sort?: Record<string, 1 | -1>, // Ensure sort is typed correctly
    skip?: number,
    limit?: number,
  ): Promise<any[]> {
    const collection = this.getCollection<Document>(collectionName);
    return collection
      .find(condition, { projection })
      .sort(sort)
      .collation({ locale: 'en_US', numericOrdering: true })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  async countDocuments(
    collectionName: string,
    condition: object,
  ): Promise<number> {
    const collection = this.getCollection<Document>(collectionName);
    return collection.countDocuments(condition);
  }

  async listCollections(): Promise<any[]> {
    const collections = await this.db.listCollections().toArray();
    const result = collections.map((collection) => ({ name: collection.name })); // Ensure returning only the name of the collections
    return result;
  }

  async closeConnection() {
    await this.client.close();
  }

  async findOne(collectionName: string, condition: object): Promise<any> {
    const collection = this.getCollection<Document>(collectionName);
    return collection.findOne(condition);
  }

  async aggregate(input: {
    collectionName: string;
    match?: any;
    group: any;
    sort?: any;
    project?: any;
  }) {
    const { collectionName, match, group, sort, project } = input;
    const aggregateArray: any[] = [{ $group: group }];
    if (match) aggregateArray.unshift({ $match: match });
    if (sort) aggregateArray.push({ $sort: sort });
    if (project) aggregateArray.push({ $project: project });
    const collection = this.getCollection<Document>(collectionName);
    return collection.aggregate(aggregateArray).toArray();
  }
}
