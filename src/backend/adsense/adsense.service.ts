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
      { label: 'Email', key: 'email', sortable: true },
      { label: 'PID', key: 'pid', sortable: true, link: true },
      { label: 'Limit', key: 'limit', sortable: true, type: 'center' },
      { label: 'Country', key: 'country', sortable: true, type: 'center' },
      { label: 'Blogs', key: 'blogCount', sortable: true, type: 'number' },
      { label: 'Month', key: 'month', sortable: true, type: 'currency' },
      { label: 'Balance', key: 'balance', sortable: true, type: 'currency' },
      { label: 'Sites', key: 'sites', sortable: false },
      { label: 'Error', key: 'error', sortable: false, type: 'center' },
    ];
    const totalRecords = total?.count;
    const filters = [{ key: 'anything', label: 'Anything', type: 'text' }];
    return { title: 'Adsense Ready', headers, filters, data, totalRecords, summary: '' };
  }

  async getAdsenseUnused(page: string, limit: string, sortBy: string, order: string, anything: string): Promise<LIST_RESPONSE> {
    const where: Record<string, any> = { blogCount: { $not: { $gt: 0 } }, 'sites.status': 'Ready', deletedAt: null, error: null };
    if (anything)
      where.$or = [
        { email: new RegExp(anything, 'i') },
        { pid: new RegExp(anything, 'i') },
        { sites: { $elemMatch: { name: new RegExp(anything, 'i'), status: 'Ready' } } },
      ];

    let [data, total] = await Promise.all([
      this.getAdsenseList(where, Number(limit), (Number(page) - 1) * Number(limit), sortBy, order),
      this.summaryAdsense(where),
    ]);

    const headers = [
      { label: 'Email', key: 'email', sortable: true },
      { label: 'PID', key: 'pid', sortable: true, link: true },
      { label: 'Limit', key: 'limit', sortable: true, type: 'center' },
      { label: 'Country', key: 'country', sortable: true, type: 'center' },
      { label: 'Action', key: 'action', type: 'on', sortable: false },
      { label: 'Blogs', key: 'blogCount', sortable: true, type: 'number' },
      { label: 'RPM', key: 'rpm', sortable: true, type: 'currency' },
      { label: 'Views', key: 'views', sortable: true, type: 'number' },
      { label: 'Clicks', key: 'clicks', sortable: true, type: 'number' },
      { label: 'Today', key: 'today', sortable: true, type: 'currency' },
      { label: 'Month', key: 'month', sortable: true, type: 'currency' },
      { label: 'Balance', key: 'balance', sortable: true, type: 'currency' },
      { label: 'Sites', key: 'sites', sortable: false },
    ];
    const totalRecords = total?.count;
    const filters = [{ key: 'anything', label: 'Anything', type: 'text' }];
    return { title: 'Adsense Ready', headers, filters, data, totalRecords, summary: '' };
  }

  async getAdsenseWordpress(page: string, limit: string, sortBy: string, order: string, anything: string): Promise<LIST_RESPONSE> {
    const where: Record<string, any> = { ...READY_WORDPRESS, deletedAt: null, error: null };
    if (anything) where.$or = [{ email: new RegExp(anything, 'i') }, { pid: new RegExp(anything, 'i') }];

    let [data, total] = await Promise.all([
      this.getAdsenseList(where, Number(limit), (Number(page) - 1) * Number(limit), sortBy, order),
      this.summaryAdsense(where),
    ]);

    const headers = [
      { label: 'Email', key: 'email', sortable: true },
      { label: 'PID', key: 'pid', sortable: true, link: true },
      { label: 'Limit', key: 'limit', sortable: true, type: 'center' },
      { label: 'Country', key: 'country', sortable: true, type: 'center' },
      { label: 'UTC', key: 'utc', sortable: true, type: 'number' },
      { label: 'Action', key: 'action', type: 'off', sortable: false },
      { label: 'Blogs', key: 'blogCount', sortable: true, type: 'number' },
      { label: 'RPM', key: 'rpm', sortable: true, type: 'currency' },
      { label: 'Views', key: 'views', sortable: true, type: 'number' },
      { label: 'Clicks', key: 'clicks', sortable: true, type: 'number' },
      { label: 'Today', key: 'today', sortable: true, type: 'currency' },
      { label: 'Yesterday', key: 'yesterday', sortable: true, type: 'currency' },
      { label: 'Month', key: 'month', sortable: true, type: 'currency' },
      { label: 'Balance', key: 'balance', sortable: true, type: 'currency' },
      { label: 'Updated', key: 'updated', sortable: false, type: 'center' },
    ];
    const totalRecords = total?.count;
    const summary = `today: ${total.today} $, yesterday: ${total.yesterday} $, month: ${total.month} $`;
    const filters = [{ key: 'anything', label: 'Anything', type: 'text' }];
    return { title: 'Adsense Ready', headers, filters, data, totalRecords, summary };
  }

  async getAdsenseUsing(page: string, limit: string, sortBy: string = 'rpm', order: string, anything: string): Promise<LIST_RESPONSE> {
    const where: Record<string, any> = { 'sites.status': 'Ready', deletedAt: null, error: null };
    if (anything) where.$or = [{ email: new RegExp(anything, 'i') }, { pid: new RegExp(anything, 'i') }];

    let [data, total] = await Promise.all([
      this.getAdsenseList(where, Number(limit), (Number(page) - 1) * Number(limit), sortBy, order),
      this.summaryAdsense(where),
    ]);

    const headers = [
      { label: 'Email', key: 'email', sortable: true },
      { label: 'PID', key: 'pid', sortable: true, link: true },
      { label: 'Limit', key: 'limit', sortable: true, type: 'center' },
      { label: 'Country', key: 'country', sortable: true, type: 'center' },
      { label: 'UTC', key: 'utc', sortable: true, type: 'number' },
      { label: 'Action', key: 'action', type: 'off', sortable: false },
      { label: 'Blogs', key: 'blogCount', sortable: true, type: 'number' },
      { label: 'RPM', key: 'rpm', sortable: true, type: 'currency' },
      { label: 'Views', key: 'views', sortable: true, type: 'number' },
      { label: 'Clicks', key: 'clicks', sortable: true, type: 'number' },
      { label: 'Today', key: 'today', sortable: true, type: 'currency' },
      { label: 'Yesterday', key: 'yesterday', sortable: true, type: 'currency' },
      { label: 'Month', key: 'month', sortable: true, type: 'currency' },
      { label: 'Balance', key: 'balance', sortable: true, type: 'currency' },
      { label: 'Updated', key: 'updated', sortable: false, type: 'center' },
    ];
    const totalRecords = total?.count;
    const summary = `today: ${total.today} $, yesterday: ${total.yesterday} $, month: ${total.month} $`;
    const filters = [{ key: 'anything', label: 'Anything', type: 'text' }];
    return { title: 'Adsense Ready', headers, filters, data, totalRecords, summary };
  }

  async getAdsensePantip(page: string, limit: string, sortBy: string = 'rpm', order: string = 'desc', anything: string): Promise<LIST_RESPONSE> {
    const where: Record<string, any> = { ...READY_PANTIP, deletedAt: null, error: null };
    if (anything) where.$or = [{ email: new RegExp(anything, 'i') }, { pid: new RegExp(anything, 'i') }];

    let [data, total] = await Promise.all([
      this.getAdsenseList(where, Number(limit), (Number(page) - 1) * Number(limit), sortBy, order),
      this.summaryAdsense(where),
    ]);

    const headers = [
      { label: 'Email', key: 'email', sortable: true },
      { label: 'PID', key: 'pid', sortable: true, link: true },
      { label: 'Limit', key: 'limit', sortable: true, type: 'center' },
      { label: 'Country', key: 'country', sortable: true, type: 'center' },
      { label: 'UTC', key: 'utc', sortable: true, type: 'number' },
      { label: 'Action', key: 'action', type: 'off', sortable: false },
      { label: 'Blogs', key: 'blogCount', sortable: true, type: 'number' },
      { label: 'RPM', key: 'rpm', sortable: true, type: 'currency' },
      { label: 'Views', key: 'views', sortable: true, type: 'number' },
      { label: 'Clicks', key: 'clicks', sortable: true, type: 'number' },
      { label: 'Today', key: 'today', sortable: true, type: 'currency' },
      { label: 'Yesterday', key: 'yesterday', sortable: true, type: 'currency' },
      { label: 'Month', key: 'month', sortable: true, type: 'currency' },
      { label: 'Balance', key: 'balance', sortable: true, type: 'currency' },
      { label: 'Updated', key: 'updated', sortable: false, type: 'center' },
    ];
    const totalRecords = total?.count;
    const summary = `today: ${total.today} $, yesterday: ${total.yesterday} $, month: ${total.month} $`;
    const filters = [{ key: 'anything', label: 'Anything', type: 'text' }];
    return { title: 'Adsense Ready', headers, filters, data, totalRecords, summary };
  }

  async getAdsenseList(where: any, limit: number, skip: number, sortBy: string, order: string) {
    const data = await this.gaCollection
      .find(where)
      .sort({ [ADSENSE_SORT[sortBy || 'email']]: order === 'asc' ? 1 : -1 })
      .skip(skip || 0)
      .limit(limit || 100)
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
      rpm: d.todayReport?.pageRPM,
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

  async getWebsites(status: string, wordpress: string, name: string) {
    const adsenseData = await this.gaCollection.find({ error: null, 'sites.status': status }).toArray();
    const data = [];

    adsenseData.forEach((ga) => {
      ga.sites.forEach((site) => {
        if (
          site.status === status &&
          (!wordpress || !/html5gameportal.com|minigame.vip|pantip.com/.test(site.name)) &&
          (!name || new RegExp(name).test(site.name))
        ) {
          data.push(site);
        }
      });
    });
    const headers = [
      { label: 'Email', key: 'email', sortable: true },
      { label: 'PID', key: 'pid', sortable: true, link: true },
      { label: 'Limit', key: 'limit', sortable: true, type: 'center' },
      { label: 'Country', key: 'country', sortable: true, type: 'center' },
      { label: 'Action', key: 'action', type: 'off', sortable: false },
      { label: 'Blogs', key: 'blogCount', sortable: true, type: 'number' },
      { label: 'RPM', key: 'rpm', sortable: true, type: 'currency' },
      { label: 'Views', key: 'views', sortable: true, type: 'number' },
      { label: 'Clicks', key: 'clicks', sortable: true, type: 'number' },
      { label: 'Today', key: 'today', sortable: true, type: 'currency' },
      { label: 'Month', key: 'month', sortable: true, type: 'currency' },
      { label: 'Balance', key: 'balance', sortable: true, type: 'currency' },
      { label: 'Sites', key: 'sites', sortable: false },
    ];
    const totalRecords = data.length;
    const filters = [
      { key: 'name', label: 'Site', type: 'text' },
      { key: 'wordpress', label: 'Wordpress', type: 'checkbox' },
    ];
    return { title: 'Adsense Ready', headers, filters, data, totalRecords, summary: '' };
  }
}
