// adsense.service.ts

import { Injectable } from '@nestjs/common';
import { MongodbService } from '../mongodb/mongodb.service';

@Injectable()
export class AdsenseService {
  constructor(private readonly mongodbService: MongodbService) {}

  async getAdsenseData(
    page: string = '1',
    limit: string = '100',
    sortBy: string = 'rpm',
    order: string = 'desc',
    invite: string,
  ): Promise<any[]> {
    const SORT_FIELDS = {
      rpm: 'todayReport.pageRPM',
      views: 'todayReport.pageViews',
      impressions: 'todayReport.impressions',
      updated: 'todayReport.updatedAt',
      clicks: 'todayReport.clicks',
      invite: 'email',
    };

    const where: Record<string, any> = {
      'sites.status': 'Ready',
      deletedAt: null,
      error: null,
    };
    if (invite) where.email = new RegExp(invite.toLowerCase());
    const data = await this.mongodbService.fetchData(
      'google_adsense',
      where,
      {
        today: 1,
        yesterday: 1,
        month: 1,
        balance: 1,
        todayReport: 1,
        limit: 1,
        country: 1,
        email: 1,
        pid: 1,
        utc: 1,
        blogCount: 1,
      },
      { [SORT_FIELDS[sortBy] || sortBy]: order === 'asc' ? 1 : -1 },
      (Number(page) - 1) * Number(limit),
      Number(limit),
    );

    return data.map((d) => {
      return {
        invite: d.email?.replace('@minori.com.vn', ''),
        pid: d.pid,
        country: d.country,
        utc: d.utc,
        limit: d.limit,
        blogs: d.blogCount,
        wait: d.wait,
        rpm: d.todayReport?.pageRPM,
        views: d.todayReport?.pageViews,
        impressions: d.todayReport?.impressions,
        clicks: d.todayReport?.clicks,
        today: d.today,
        yesterday: d.yesterday,
        month: d.month,
        balance: d.balance,
        updated: d.todayReport?.updatedAt,
      };
    });
  }

  async getAdsenseSummary(invite: string): Promise<any> {
    const where: Record<string, any> = {
      'sites.status': 'Ready',
      deletedAt: null,
      error: null,
    };
    if (invite) where.email = new RegExp(invite.toLowerCase());
    const result = await this.mongodbService.aggregate({
      collectionName: 'google_adsense',
      match: where,
      group: {
        _id: '',
        today: { $sum: '$today' },
        yesterday: { $sum: '$yesterday' },
        month: { $sum: '$month' },
        balance: { $sum: '$balance' },
      },
    });

    return result[0];
  }

  async getAdsenseDetail(pid: string): Promise<any> {
    return this.mongodbService.findOne('google_adsense', { pid });
  }
}
