// adsense.service.ts

import { Injectable } from '@nestjs/common';
import { LIST_RESPONSE } from '@src/constants';
import { Collection } from 'mongodb';
import { MongoDBService } from '../mongodb/mongodb.service';

@Injectable()
export class WebsiteService {
  private gaCollection: Collection;
  private sitesApplyCollection: Collection;
  constructor(private readonly mongodbService: MongoDBService) {
    this.gaCollection = this.mongodbService.getCollection('google_adsense');
    this.sitesApplyCollection = this.mongodbService.getCollection('sites_apply');
  }
  async getWebsites(
    status: string,
    page: string,
    limit: string,
    sortBy: string = 'rpm',
    order: string = 'desc',
    name: string,
    wordpress: string,
  ): Promise<LIST_RESPONSE> {
    const where: Record<string, any> = { status };
    if (name) where.name = new RegExp(name, 'i');
    if (wordpress) where.sites = { $elemMatch: { name: { $not: /pantip.com|minigame.vip|html5gameportal.com/ }, status: 'Ready' } };

    let [data, total] = await Promise.all([
      this.getSitesApplyList(where, Number(limit), (Number(page) - 1) * Number(limit), sortBy, order),
      this.summarySitesApply(where),
    ]);

    const headers = [
      { label: 'Email', key: 'email', sortable: true },
      { label: 'PID', key: 'pid', sortable: true, link: true },
      { label: 'Site', key: 'name', sortable: true },
      { label: 'Status', key: 'status', sortable: true, type: 'center' },
      { label: 'updatedAt', key: 'updatedAt', sortable: true, type: 'center' },
    ];
    const totalRecords = total?.count;
    const filters = [
      { key: 'name', label: 'Site', type: 'text' },
      { key: 'wordpress', label: 'Wordpress', type: 'checkbox' },
    ];
    return { title: `Website ${status}`, headers, filters, data, totalRecords, summary: '' };
  }

  async getSitesApplyList(where: any, limit: number, skip: number, sortBy: string, order: string) {
    const data = await this.sitesApplyCollection
      .find(where)
      .sort({ [sortBy || 'email']: order === 'asc' ? 1 : -1 })
      .skip(skip || 0)
      .limit(limit || 100)
      .toArray();
    return data;
  }

  async summarySitesApply(where: any) {
    const result = await this.sitesApplyCollection
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
