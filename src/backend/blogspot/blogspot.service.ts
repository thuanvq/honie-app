// adsense.service.ts

import { Injectable } from '@nestjs/common';
import { Collection } from 'mongodb';
import { LIST_RESPONSE } from '../../constants';
import { MongoDBService } from '../mongodb/mongodb.service';

@Injectable()
export class BlogspotService {
  private gaCollection: Collection;
  private blogspotCollection: Collection;
  constructor(private readonly mongodbService: MongoDBService) {
    this.gaCollection = this.mongodbService.getCollection('google_adsense');
    this.blogspotCollection = this.mongodbService.getCollection('sites_blog');
  }
  async getBlogspotsUsing(page: string, limit: string, sortBy: string = 'rpm', order: string = 'desc', website: string): Promise<LIST_RESPONSE> {
    const where: Record<string, any> = { pid: /pub-/ };
    if (website) where.website = new RegExp(website, 'i');

    let [data, total] = await Promise.all([
      this.getBlogspot(where, Number(limit), (Number(page) - 1) * Number(limit), sortBy, order),
      this.summaryBlogspot(where),
    ]);

    const totalRecords = total?.count;
    const filters = [{ key: 'website', label: 'Website', type: 'text' }];
    return { title: `Blogspot Using`, headers: BLOGSPOT_HEADERS, filters, data, totalRecords, summary: '' };
  }
  async getBlogspotsTemp(page: string, limit: string, sortBy: string = 'rpm', order: string = 'desc', website: string): Promise<LIST_RESPONSE> {
    const where: Record<string, any> = { pid: 'TEMP' };
    if (website) where.website = new RegExp(website, 'i');

    let [data, total] = await Promise.all([
      this.getBlogspot(where, Number(limit), (Number(page) - 1) * Number(limit), sortBy, order),
      this.summaryBlogspot(where),
    ]);

    const totalRecords = total?.count;
    const filters = [{ key: 'website', label: 'Website', type: 'text' }];
    return { title: `Blogspot TEMP`, headers: BLOGSPOT_HEADERS, filters, data, totalRecords, summary: '' };
  }
  async getBlogspotsUnused(page: string, limit: string, sortBy: string = 'rpm', order: string = 'desc', website: string): Promise<LIST_RESPONSE> {
    const where: Record<string, any> = { pid: null };
    if (website) where.website = new RegExp(website, 'i');

    let [data, total] = await Promise.all([
      this.getBlogspot(where, Number(limit), (Number(page) - 1) * Number(limit), sortBy, order),
      this.summaryBlogspot(where),
    ]);

    const totalRecords = total?.count;
    const filters = [{ key: 'website', label: 'Website', type: 'text' }];
    return { title: `Blogspot Unused`, headers: BLOGSPOT_HEADERS, filters, data, totalRecords, summary: '' };
  }

  async getBlogspot(where: any, limit: number, skip: number, sortBy: string, order: string) {
    const data = await this.blogspotCollection
      .find(where)
      .sort({ [sortBy || 'email']: order === 'asc' ? 1 : -1 })
      .skip(skip || 0)
      .limit(limit || 100)
      .project({ email: 1, pid: 1, website: 1, pantip: 1, posts: { $size: '$urls' } })
      .toArray();
    return data;
  }

  async summaryBlogspot(where: any) {
    const result = await this.blogspotCollection
      .aggregate([
        { $match: where },
        {
          $group: {
            _id: '',
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();
    return result[0];
  }
}

const BLOGSPOT_HEADERS = [
  { label: 'Email', key: 'email', sortable: true },
  { label: 'PID', key: 'pid', sortable: true, link: true },
  { label: 'Website', key: 'website', sortable: true },
  { label: 'Pantip', key: 'pantip', sortable: true, type: 'center' },
  { label: 'Posts', key: 'posts', sortable: true, type: 'center' },
];
