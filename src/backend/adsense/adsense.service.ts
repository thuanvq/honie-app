// adsense.service.ts

import { Injectable } from '@nestjs/common';
import { ADSENSE_SORT, COUNTRY_CODE, LIST_RESPONSE, READY_PANTIP, READY_WORDPRESS } from '@src/constants';
import { Collection } from 'mongodb';
import { MongoDBService } from '../mongodb/mongodb.service';

@Injectable()
export class AdsenseService {
  private gaCollection: Collection;
  private blogCollection: Collection;
  constructor(private readonly mongodbService: MongoDBService) {
    this.gaCollection = this.mongodbService.getCollection('google_adsense');
    this.blogCollection = this.mongodbService.getCollection('sites_blog');
  }

  async addBlogspot(pid: string) {
    await this.gaCollection.updateOne({ pid }, { $inc: { needBlog: 1 } });
    return true;
  }

  async stopBlogspot(pid: string) {
    await Promise.all([
      this.gaCollection.updateOne({ pid }, { $inc: { blogCount: -1 } }),
      this.blogCollection.updateOne({ pantip: true, pid }, { $set: { pantip: false, pid: 'TEMP' } }),
    ]);
    return true;
  }

  async getAdsenseDetail(input: string): Promise<any> {
    return this.gaCollection.findOne({ $or: [{ pid: new RegExp(input, 'i') }, { email: new RegExp(input, 'i') }] });
  }

  async getAdsenseError(page: string, limit: string, sortBy: string, order: string, anything: string): Promise<LIST_RESPONSE> {
    const where: Record<string, any> = { error: { $ne: null }, deletedAt: null };
    if (anything) where.$or = [{ email: new RegExp(anything, 'i') }, { pid: new RegExp(anything, 'i') }];

    let [data, total] = await Promise.all([
      this.getAdsenseList(where, Number(limit), (Number(page) - 1) * Number(limit), sortBy, order),
      this.summaryAdsense(where),
    ]);

    const headers = [
      ADSENSE_COLUMN.EMAIL,
      ADSENSE_COLUMN.PID,
      ADSENSE_COLUMN.LIMIT,
      ADSENSE_COLUMN.COUNTRY,
      ADSENSE_COLUMN.BLOG_COUNT,
      ADSENSE_COLUMN.MONTH,
      ADSENSE_COLUMN.BALANCE,
      ADSENSE_COLUMN.SITES,
      ADSENSE_COLUMN.ERROR,
    ];
    const totalRecords = total?.count;
    const filters = [{ key: 'anything', label: 'Anything', type: 'text' }];
    return { title: 'Adsense Error', headers, filters, data, totalRecords, summary: '' };
  }

  async getAdsenseUnused(page: string, limit: string, sortBy: string, order: string, anything: string): Promise<LIST_RESPONSE> {
    const where: Record<string, any> = { blogCount: { $not: { $gt: 0 } }, 'sites.status': 'Ready', deletedAt: null, error: null };
    if (anything)
      where.$or = [
        { email: new RegExp(anything, 'i') },
        { pid: new RegExp(anything, 'i') },
        { sites: { $elemMatch: { name: new RegExp(anything, 'i'), status: 'Ready' } } },
      ];

    const data = await this.gaCollection
      .find(where)
      .sort({ [ADSENSE_SORT[sortBy || 'email']]: order === 'asc' ? 1 : -1 })
      .project({
        email: 1,
        pid: 1,
        needBlog: 1,
        information: 1,
        sites: 1,
        balance: 1,
        monthReport: { estimatedEarnings: 1 },
        report: { date: 1, pageRPM: 1 },
      })
      .toArray();
    data.forEach((d) => {
      d.sites = d.sites
        ?.filter((x) => x.status === 'Ready')
        .map((x) => x.name)
        .join(',');
      d.report?.forEach((r) => {
        d[r.date] = r.pageRPM;
      });
      d.country = COUNTRY_CODE[d.information?.country] || d.information?.country;
      d.utc = d.information?.utc;
      d.limit = d.information?.limit?.replace(' 2024', '');
      d.month = d.monthReport?.estimatedEarnings;
      d.on = !d.needBlog;
    });

    const headers: any[] = [ADSENSE_COLUMN.EMAIL, ADSENSE_COLUMN.PID, ADSENSE_COLUMN.LIMIT, ADSENSE_COLUMN.COUNTRY, ADSENSE_COLUMN.ACTION_ON];
    const date = new Date().getDate();
    for (let i = date; i > 0; i--) {
      headers.push({ label: `06-0${i}`, key: `2024060${i}`, sortable: true, type: 'currency' });
    }
    headers.push(ADSENSE_COLUMN.MONTH);
    headers.push(ADSENSE_COLUMN.BALANCE);
    headers.push(ADSENSE_COLUMN.SITES);

    const totalRecords = data.length;
    const filters = [{ key: 'anything', label: 'Anything', type: 'text' }];
    return { title: 'Adsense Unused', headers, filters, data, totalRecords, summary: '' };
  }

  async getAdsenseWordpress(page: string, limit: string, sortBy: string, order: string, anything: string): Promise<LIST_RESPONSE> {
    const where: Record<string, any> = { ...READY_WORDPRESS, deletedAt: null, error: null };
    if (anything) where.$or = [{ email: new RegExp(anything, 'i') }, { pid: new RegExp(anything, 'i') }];

    let [data, total] = await Promise.all([
      this.getAdsenseList(where, Number(limit), (Number(page) - 1) * Number(limit), sortBy, order),
      this.summaryAdsense(where),
    ]);

    const headers = [
      ADSENSE_COLUMN.EMAIL,
      ADSENSE_COLUMN.PID,
      ADSENSE_COLUMN.LIMIT,
      ADSENSE_COLUMN.COUNTRY,
      ADSENSE_COLUMN.UTC,
      ADSENSE_COLUMN.ACTION_OFF,
      ADSENSE_COLUMN.BLOG_COUNT,
      ADSENSE_COLUMN.RPM,
      ADSENSE_COLUMN.VIEWS,
      ADSENSE_COLUMN.CLICKS,
      ADSENSE_COLUMN.TODAY,
      ADSENSE_COLUMN.YESTERDAY,
      ADSENSE_COLUMN.MONTH,
      ADSENSE_COLUMN.BALANCE,
      ADSENSE_COLUMN.UPDATED,
    ];
    const totalRecords = total?.count;
    const summary = `today: ${total.today} $, yesterday: ${total.yesterday} $, month: ${total.month} $`;
    const filters = [{ key: 'anything', label: 'Anything', type: 'text' }];
    return { title: 'Adsense Wordpress', headers, filters, data, totalRecords, summary };
  }

  async getAdsenseReady(page: string, limit: string, sortBy: string = 'rpm', order: string, anything: string): Promise<LIST_RESPONSE> {
    const where: Record<string, any> = { 'sites.status': 'Ready', deletedAt: null, error: null };
    if (anything) where.$or = [{ email: new RegExp(anything, 'i') }, { pid: new RegExp(anything, 'i') }];

    let [data, total] = await Promise.all([
      this.getAdsenseList(where, Number(limit), (Number(page) - 1) * Number(limit), sortBy, order),
      this.summaryAdsense(where),
    ]);

    const headers = [
      ADSENSE_COLUMN.EMAIL,
      ADSENSE_COLUMN.PID,
      ADSENSE_COLUMN.LIMIT,
      ADSENSE_COLUMN.COUNTRY,
      ADSENSE_COLUMN.UTC,
      ADSENSE_COLUMN.ACTION_OFF,
      ADSENSE_COLUMN.BLOG_COUNT,
      ADSENSE_COLUMN.RPM,
      ADSENSE_COLUMN.VIEWS,
      ADSENSE_COLUMN.CLICKS,
      ADSENSE_COLUMN.TODAY,
      ADSENSE_COLUMN.YESTERDAY,
      ADSENSE_COLUMN.MONTH,
      ADSENSE_COLUMN.BALANCE,
      ADSENSE_COLUMN.UPDATED,
    ];
    const totalRecords = total?.count;
    const summary = `today: ${total.today} $, yesterday: ${total.yesterday} $, month: ${total.month} $`;
    const filters = [{ key: 'anything', label: 'Anything', type: 'text' }];
    return { title: 'Adsense Ready', headers, filters, data, totalRecords, summary };
  }

  async getAdsenseRunning(page: string, limit: string, sortBy: string = 'rpm', order: string, anything: string): Promise<LIST_RESPONSE> {
    const where: Record<string, any> = { blogCount: { $gt: 0 }, deletedAt: null, error: null };
    if (anything) where.$or = [{ email: new RegExp(anything, 'i') }, { pid: new RegExp(anything, 'i') }];

    let [data, total] = await Promise.all([
      this.getAdsenseList(where, Number(limit), (Number(page) - 1) * Number(limit), sortBy, order),
      this.summaryAdsense(where),
    ]);

    const headers = [
      ADSENSE_COLUMN.EMAIL,
      ADSENSE_COLUMN.PID,
      ADSENSE_COLUMN.LIMIT,
      ADSENSE_COLUMN.COUNTRY,
      ADSENSE_COLUMN.UTC,
      ADSENSE_COLUMN.ACTION_OFF,
      ADSENSE_COLUMN.BLOG_COUNT,
      ADSENSE_COLUMN.RPM,
      ADSENSE_COLUMN.VIEWS,
      ADSENSE_COLUMN.IMPRESSIONS,
      ADSENSE_COLUMN.CLICKS,
      ADSENSE_COLUMN.TODAY,
      ADSENSE_COLUMN.YESTERDAY,
      ADSENSE_COLUMN.MONTH,
      ADSENSE_COLUMN.BALANCE,
      ADSENSE_COLUMN.UPDATED,
    ];
    const totalRecords = total?.count;
    const summary = `today: ${total.today} $, yesterday: ${total.yesterday} $, month: ${total.month} $`;
    const filters = [{ key: 'anything', label: 'Anything', type: 'text' }];
    return { title: 'Adsense Running', headers, filters, data, totalRecords, summary };
  }

  async getAdsensePantip(page: string, limit: string, sortBy: string = 'rpm', order: string = 'desc', anything: string): Promise<LIST_RESPONSE> {
    const where: Record<string, any> = { ...READY_PANTIP, deletedAt: null, error: null };
    if (anything) where.$or = [{ email: new RegExp(anything, 'i') }, { pid: new RegExp(anything, 'i') }];

    let [data, total] = await Promise.all([
      this.getAdsenseList(where, Number(limit), (Number(page) - 1) * Number(limit), sortBy, order),
      this.summaryAdsense(where),
    ]);

    const headers = [
      ADSENSE_COLUMN.EMAIL,
      ADSENSE_COLUMN.PID,
      ADSENSE_COLUMN.LIMIT,
      ADSENSE_COLUMN.COUNTRY,
      ADSENSE_COLUMN.UTC,
      ADSENSE_COLUMN.ACTION_OFF,
      ADSENSE_COLUMN.BLOG_COUNT,
      ADSENSE_COLUMN.RPM,
      ADSENSE_COLUMN.VIEWS,
      ADSENSE_COLUMN.CLICKS,
      ADSENSE_COLUMN.TODAY,
      ADSENSE_COLUMN.YESTERDAY,
      ADSENSE_COLUMN.MONTH,
      ADSENSE_COLUMN.BALANCE,
      ADSENSE_COLUMN.UPDATED,
    ];
    const totalRecords = total?.count;
    const summary = `today: ${total.today} $, yesterday: ${total.yesterday} $, month: ${total.month} $`;
    const filters = [{ key: 'anything', label: 'Anything', type: 'text' }];
    return { title: 'Adsense Pantip', headers, filters, data, totalRecords, summary };
  }

  async getAdsenseList(where: any, limit: number, skip: number, sortBy: string, order: string) {
    const data = await this.gaCollection
      .find(where)
      .sort({ [ADSENSE_SORT[sortBy || 'email']]: order === 'asc' ? 1 : -1 })
      .skip(skip || 0)
      .limit(limit || 100)
      .project({
        email: 1,
        pid: 1,
        error: 1,
        balance: 1,
        blogCount: 1,
        needBlog: 1,
        information: 1,
        sites: 1,
        todayReport: 1,
        yesterdayReport: { estimatedEarnings: 1 },
        monthReport: { estimatedEarnings: 1 },
      })
      .toArray();
    return data.map((d) => ({
      ...d,
      sites: d.sites
        ?.filter((x) => x.status === 'Ready')
        .map((x) => x.name)
        .join(','),
      country: COUNTRY_CODE[d.information?.country] || d.information?.country,
      utc: d.information?.utc,
      limit: d.information?.limit?.replace(' 2024', ''),
      rpm: d.todayReport?.pageRPM === -1 ? null : d.todayReport?.pageRPM,
      views: d.todayReport?.pageViews,
      impressions: d.todayReport?.impressions,
      clicks: d.todayReport?.clicks,
      today: d.todayReport?.estimatedEarnings,
      updated: d.todayReport?.updatedAt,
      yesterday: d.yesterdayReport?.estimatedEarnings,
      month: d.monthReport?.estimatedEarnings,
      on: !d.needBlog,
      off: !!d.blogCount,
    }));
  }

  async summaryAdsense(where: any) {
    const result = await this.gaCollection
      .aggregate([
        { $match: where },
        {
          $group: {
            _id: '',
            today: { $sum: '$todayReport.estimatedEarnings' },
            yesterday: { $sum: '$yesterdayReport.estimatedEarnings' },
            month: { $sum: '$monthReport.estimatedEarnings' },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();
    return result[0];
  }
}
const ADSENSE_COLUMN = {
  EMAIL: { label: 'Email', key: 'email', sortable: true },
  PID: { label: 'PID', key: 'pid', sortable: true, link: true },
  LIMIT: { label: 'Limit', key: 'limit', sortable: true, type: 'center' },
  COUNTRY: { label: 'Country', key: 'country', sortable: true, type: 'center' },
  UTC: { label: 'UTC', key: 'utc', sortable: true, type: 'number' },
  ACTION_OFF: { label: 'Action', key: 'action', type: 'off', sortable: false },
  ACTION_ON: { label: 'Action', key: 'action', type: 'on', sortable: false },
  BLOG_COUNT: { label: 'Blogs', key: 'blogCount', sortable: true, type: 'number' },
  RPM: { label: 'RPM', key: 'rpm', sortable: true, type: 'currency' },
  VIEWS: { label: 'Views', key: 'views', sortable: true, type: 'number' },
  IMPRESSIONS: { label: 'Impr', key: 'impressions', sortable: true, type: 'number' },
  CLICKS: { label: 'Clicks', key: 'clicks', sortable: true, type: 'number' },
  TODAY: { label: 'Today', key: 'today', sortable: true, type: 'currency' },
  YESTERDAY: { label: 'Yesterday', key: 'yesterday', sortable: true, type: 'currency' },
  MONTH: { label: 'Month', key: 'month', sortable: true, type: 'currency' },
  BALANCE: { label: 'Balance', key: 'balance', sortable: true, type: 'currency' },
  UPDATED: { label: 'Updated', key: 'updated', sortable: false, type: 'center' },
  SITES: { label: 'Sites', key: 'sites', sortable: false },
  ERROR: { label: 'Error', key: 'error', sortable: false, type: 'center' },
};
