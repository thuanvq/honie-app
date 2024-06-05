// adsense.service.ts

import { Injectable } from '@nestjs/common';
import { COUNTRY_CODE, LIST_RESPONSE, SORT_FIELDS } from '@src/constants';
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
    if (invite) where.email = new RegExp(invite, 'i');
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
        needBlog: 1,
      },
      { [SORT_FIELDS[sortBy] || sortBy]: order === 'asc' ? 1 : -1 },
      (Number(page) - 1) * Number(limit),
      Number(limit),
    );

    return data.map((d) => {
      return {
        invite: d.email?.replace('@minori.com.vn', ''),
        pid: d.pid,
        country: COUNTRY_CODE[d.country] || d.country,
        utc: d.utc,
        limit: d.limit?.replace(' 2024', ''),
        blogs: d.blogCount || '',
        wait: d.needBlog || '',
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
    if (invite) where.email = new RegExp(invite, 'i');
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
    return this.mongodbService.findOne('google_adsense', {
      $or: [{ pid: new RegExp(pid, 'i') }, { email: new RegExp(pid, 'i') }],
    });
  }

  async getErrorAdsenseData() {
    const adsenseData = await this.mongodbService.fetchData(
      'google_adsense',
      { error: { $exists: true } },
      { email: 1, pid: 1, error: 1, month: 1, balance: 1, sites: 1 },
      { email: 1 },
      0,
      100,
    );
    return adsenseData.map((data) => ({
      email: data.email,
      pid: data.pid,
      error: data.error,
      month: data.month,
      balance: data.balance,
      sites: data.sites
        .filter((site) => site.status === 'Ready')
        .map((site) => site.name)
        .join(','),
    }));
  }

  async getWebsites(status: string, wordpress: string, name: string) {
    const adsenseData = await this.mongodbService.fetchData(
      'google_adsense',
      { error: null, 'sites.status': status },
      { email: 1, pid: 1, sites: 1, fetchedAt: 1 },
      { email: -1 },
      0,
      1000,
    );
    const result = [];
    adsenseData.forEach((data) => {
      data.sites.forEach((site) => {
        if (
          site.status === status &&
          (!wordpress || !/html5gameportal.com|minigame.vip|pantip.com/.test(site.name)) &&
          (!name || new RegExp(name).test(site.name))
        ) {
          result.push({
            email: data.email,
            pid: data.pid,
            fetchedAt: data.fetchedAt,
            name: site.name,
          });
        }
      });
    });
    return result;
  }

  async getUnused(email: string, site: string) {
    const where: Record<string, any> = {
      blogCount: { $not: { $gt: 0 } },
      'sites.status': 'Ready',
      deletedAt: null,
      error: null,
    };
    if (email) where.email = new RegExp(email, 'i');
    if (site) where.sites = { $elemMatch: { name: new RegExp(site, 'i'), status: 'Ready' } };

    const adsenseData = await this.mongodbService.fetchData(
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
        needBlog: 1,
        sites: 1,
      },
      { email: -1 },
      0,
      1000,
    );

    return adsenseData.map((data) => {
      const sites = data.sites
        .filter((s) => s.status === 'Ready')
        .map((s) => s.name)
        .join(',');
      return {
        email: data.email,
        pid: data.pid,
        limit: data.limit,
        rpm: data.todayReport?.pageRPM,
        views: data.todayReport?.pageViews,
        today: data.today,
        yesterday: data.yesterday,
        month: data.month,
        balance: data.balance,
        sites: sites,
        done: !!data.needBlog,
      };
    });
  }

  async runAdsense(pid: string) {
    await this.mongodbService.updateOne('google_adsense', { pid }, { $inc: { needBlog: 1 } }, {});
    return true;
  }

  async getAdsenseWordpress(
    page: string = '1',
    limit: string = '100',
    sortBy: string = 'email',
    order: string = 'desc',
    anything: string,
  ): Promise<LIST_RESPONSE> {
    const where: Record<string, any> = {
      sites: { $elemMatch: { name: { $not: /pantip.com|minigame.vip|html5gameportal.com/ }, status: 'Ready' } },
      deletedAt: null,
      error: null,
    };
    if (anything)
      where.$or = [
        { email: new RegExp(anything, 'i') },
        { pid: new RegExp(anything, 'i') },
        { sites: { $elemMatch: { name: new RegExp(anything, 'i'), status: 'Ready' } } },
      ];

    let data = await this.mongodbService.fetchData(
      'google_adsense',
      where,
      {
        email: 1,
        pid: 1,
        balance: 1,
        todayReport: 1,
        monthReport: 1,
        yesterdayReport: 1,
        information: 1,
        sites: 1,
        blogCount: 1,
        needBlog: 1,
      },
      { [SORT_FIELDS[sortBy] || sortBy || 'email']: order === 'asc' ? 1 : -1 },
      (Number(page) - 1) * Number(limit),
      Number(limit),
    );

    data = data.map((data) => {
      const sites = data.sites
        .filter((s) => s.status === 'Ready')
        .map((s) => s.name)
        .join(',');
      return {
        email: data.email,
        pid: data.pid,
        limit: data.information?.limit?.replace(' 2024', ''),
        rpm: data.todayReport?.pageRPM,
        views: data.todayReport?.pageViews,
        today: data.todayReport?.estimatedEarnings,
        yesterday: data.yesterdayReport?.estimatedEarnings,
        month: data.monthReport?.estimatedEarnings,
        balance: data.balance,
        sites: sites,
        action: data.needBlog ? 'done' : 'run',
      };
    });
    const headers = [
      { label: 'Email', key: 'email', sortable: true },
      { label: 'PID', key: 'pid', sortable: true, link: true },
      { label: 'Limit', key: 'limit', sortable: true },
      { label: 'Action', key: 'action', sortable: false },
      { label: 'RPM', key: 'rpm', sortable: true, type: 'currency' },
      { label: 'Views', key: 'views', sortable: true, type: 'number' },
      { label: 'Today', key: 'today', sortable: true, type: 'currency' },
      { label: 'Yesterday', key: 'yesterday', sortable: true, type: 'currency' },
      { label: 'Month', key: 'month', sortable: true, type: 'currency' },
      { label: 'Balance', key: 'balance', sortable: true, type: 'currency' },
      { label: 'Sites', key: 'sites', sortable: false },
    ];
    const totalRecords = 450;
    const filters = [{ key: 'anything', label: 'Anything', type: 'text' }];
    return { title: 'Adsense Wordpress', headers, filters, data, totalRecords };
  }

  async runAdsenseWordpress(pid: string) {
    console.log('runAdsenseWordpress');
    return true;
  }
}
