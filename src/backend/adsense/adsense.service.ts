import { Injectable } from '@nestjs/common';
import { MongodbService } from '../mongodb/mongodb.service';
import { COUNTRY_CODE } from '../../constants';

@Injectable()
export class AdsenseService {
  constructor(private readonly mongodbService: MongodbService) {}

  async getAdsenseData(): Promise<any[]> {
    const data = await this.mongodbService.fetchData(
      'google_adsense',
      {},
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
      {},
      0,
      100,
    ); // Customize query as needed
    return data.map((d) => {
      return {
        invite: d.email?.replace('@minori.com.vn', ''),
        pid: d.pid,
        country: COUNTRY_CODE[d.country],
        utc: d.utc,
        limit: d.limit?.replace(' 2024', ''),
        blogs: d.blogCount,
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
}
