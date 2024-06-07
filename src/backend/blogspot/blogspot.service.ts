// adsense.service.ts

import { Injectable } from '@nestjs/common';
import { Collection } from 'mongodb';
import { LIST_RESPONSE } from '../../constants';
import { getDateTime } from '../../utils';
import { MongoDBService } from '../mongodb/mongodb.service';

@Injectable()
export class BlogspotService {
  private gaCollection: Collection;
  private blogspotCollection: Collection;
  private sitesBuffCollection: Collection;
  private logCollection: Collection;
  constructor(private readonly mongodbService: MongoDBService) {
    this.gaCollection = this.mongodbService.getCollection('google_adsense');
    this.blogspotCollection = this.mongodbService.getCollection('sites_blog');
    this.sitesBuffCollection = this.mongodbService.getCollection('sites_buff');
    this.logCollection = this.mongodbService.getCollection('logs_pc');
  }
  async turnOffBlog(website: string) {
    await this.blogspotCollection.updateOne({ website }, { $unset: { pantip: '', pid: '' } });
    return true;
  }
  async turnOffWebsite(name: string) {
    await this.sitesBuffCollection.updateOne({ name }, { $set: { stoppedAt: new Date() } });
    return true;
  }
  async turnOnWebsite(name: string) {
    await this.sitesBuffCollection.updateOne({ name }, { $unset: { stoppedAt: '' }, $setOnInsert: { createdAt: new Date() } }, { upsert: true });
    return true;
  }
  async getWebsites(page: string, limit: string, sortBy: string, order: string = 'desc', name: string): Promise<LIST_RESPONSE> {
    const where: Record<string, any> = {};
    if (name) where.name = new RegExp(name, 'i');

    const { date } = getDateTime(7 - 15 * 24);

    const [data, logs] = await Promise.all([
      this.sitesBuffCollection
        .find(where)
        .sort({ [sortBy || 'name']: order === 'asc' ? 1 : -1 })
        .collation({ locale: 'en_US', numericOrdering: true })
        .toArray(),
      this.logCollection
        .aggregate([
          { $match: { type: 'DIRECT', date: { $gte: date }, domain: { $not: /blogspot/ } } },
          { $group: { _id: { domain: '$domain', date: '$date' }, views: { $sum: '$view' } } },
        ])
        .toArray(),
    ]);

    const headers = [
      { label: 'Website', key: 'name', sortable: true },
      { label: 'Quota', key: 'quota', sortable: true },
      { label: 'Stop', key: 'action', type: 'off', sortable: false },
      { label: 'Run', key: 'action', type: 'on', sortable: false },
    ];
    for (let i = 0; i < 15; i++) {
      const { date: tmp } = getDateTime(7 - i * 24);
      headers.push({ label: tmp.replace('2024-', ''), key: tmp, type: 'number', sortable: true });
      data.forEach((d) => {
        d[tmp] = logs.find((l) => l._id.domain === d.name && l._id.date === tmp)?.views;
        d.on = !!d.stoppedAt;
        d.off = !d.stoppedAt;
      });
    }

    const totalRecords = data.length;
    const filters = [{ key: 'name', label: 'Website', type: 'text' }];
    return {
      title: `Websites for Goldt`,
      headers,
      filters,
      data,
      totalRecords,
      primary: 'name',
      summary: '',
      create: [
        { key: 'name', Label: 'Name', type: 'checkbox' },
        { key: 'level', Label: 'Level', type: 'text' },
      ],
    };
  }
  async getBlogspotsUsing(page: string, limit: string, sortBy: string = 'rpm', order: string = 'desc', website: string): Promise<LIST_RESPONSE> {
    const where: Record<string, any> = { pid: /pub-/ };
    if (website) where.website = new RegExp(website, 'i');

    let [data, total] = await Promise.all([
      this.getBlogspot(where, Number(limit), (Number(page) - 1) * Number(limit), sortBy, order),
      this.summaryBlogspot(where),
    ]);

    const headers = [...BLOGSPOT_HEADERS, { label: 'Stop', key: 'action', type: 'off', sortable: false }];

    const totalRecords = total?.count;
    const filters = [{ key: 'website', label: 'Website', type: 'text' }];
    return { title: `Blogspot Using`, headers, filters, data, totalRecords, primary: 'website', summary: '' };
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
      .collation({ locale: 'en_US', numericOrdering: true })
      .skip(skip || 0)
      .limit(limit || 100)
      .project({ email: 1, pid: 1, website: 1, pantip: 1, posts: { $size: '$urls' }, off: 'true' })
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
