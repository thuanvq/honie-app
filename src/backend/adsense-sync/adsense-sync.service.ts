import { Injectable } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule';
import { Collection } from 'mongodb';
import { MongoDBService } from '../mongodb/mongodb.service';
import { AdSenseUtils } from './adsense-sync.utils';

@Injectable()
export class AdsenseService {
  private googleAdsenseCollection: Collection;
  private sitesApplyCollection: Collection;
  private sitesCollection: Collection;
  private reportsTodayCollection: Collection;
  private reportsMonthCollection: Collection;

  constructor(private readonly mongoDBService: MongoDBService) {
    this.googleAdsenseCollection = this.mongoDBService.getCollection('google_adsense');
    this.sitesApplyCollection = this.mongoDBService.getCollection('sites_apply');
    this.sitesCollection = this.mongoDBService.getCollection('cookies_sites');
    this.reportsTodayCollection = this.mongoDBService.getCollection('cookies_reports_today');
    this.reportsMonthCollection = this.mongoDBService.getCollection('cookies_reports_month');
  }

  async syncAll(pid: string) {
    const functionName = 'syncAll';
    console.log('🟢', new Date(), functionName, '----> STARTED');

    const ga = await this.googleAdsenseCollection.findOne({ pid });
    const { _id, email, cookies, ablToken, aboToken, utc } = ga;

    const syncSites = await AdSenseUtils.fetchSites(email, cookies, ablToken, pid);
    // await this.googleAdsenseCollection.updateOne({ _id }, { $set: syncSites });
    // await Promise.all(
    //   syncSites.sites.map((site) => this.sitesApplyCollection.updateOne({ name: site.name }, { $set: { ...site, email, pid } }, { upsert: true })),
    // );

    // const syncToday = await AdSenseUtils.fetchTodayReport(email, cookies, aboToken, pid);
    // await this.googleAdsenseCollection.updateOne({ _id }, { $set: syncToday });

    // const syncMonth = await AdSenseUtils.fetchReportMonth(email, cookies, aboToken, utc, pid);
    // await this.googleAdsenseCollection.updateOne({ _id }, { $set: syncMonth });

    console.log('🔴', new Date(), functionName, '----> COMPLETED');
  }

  // async syncSites() {
  //   const functionName = 'syncSites';
  //   console.log('🟢', new Date(), functionName, '----> STARTED');

  //   const documents = await this.googleAdsenseCollection.find({ error: null, ablToken: { $ne: null } }).toArray();

  //   await Promise.all(
  //     documents.map(async (doc) => {
  //       const { email, pid, cookies, ablToken: token } = doc;
  //       const result = await AdSenseUtils.fetchSites(email, cookies, token, pid);

  //       if (result) {
  //         await this.googleAdsenseCollection.updateOne({ _id: doc._id }, { $set: result });
  //         await this.sitesCollection.insertMany(result.sites);
  //         const sitesApplyWithMetadata = result.sites.map((site) => ({ ...site, email, pid }));
  //         await Promise.all(
  //           sitesApplyWithMetadata.map(({ _id, ...site }) =>
  //             this.sitesApplyCollection.updateOne({ name: site.name }, { $set: site }, { upsert: true }),
  //           ),
  //         );
  //       }
  //     }),
  //   );

  //   console.log('🔴', new Date(), functionName, '----> COMPLETED');
  // }

  // async syncTodayReports() {
  //   const functionName = 'syncTodayReports';
  //   console.log('🟢', new Date(), functionName, '----> STARTED');

  //   const documents = await this.googleAdsenseCollection
  //     .find({ 'sites.status': 'Ready', error: null, aboToken: { $ne: null } })
  //     .sort({ email: 1 })
  //     .collation({ locale: 'en_US', numericOrdering: true })
  //     .toArray();
  //   const shoaibReport = [];

  //   await Promise.all(
  //     documents.map(async (doc) => {
  //       const { email, pid, cookies, aboToken: token } = doc;
  //       const result = await AdSenseUtils.fetchTodayReport(email, cookies, token, pid);

  //       if (result) {
  //         const { siteReport, todayReport } = result;
  //         await this.googleAdsenseCollection.updateOne({ _id: doc._id }, { $set: { siteReport, todayReport } });
  //         await this.reportsTodayCollection.insertMany([...siteReport, todayReport]);

  //         if (email.includes('shoaib_')) {
  //           shoaibReport.push(formatMessageToTable(result.todayReport));
  //         }
  //       }
  //     }),
  //   );
  //   if (shoaibReport.length > 0) {
  //     // await this.telegramService.sendMessage('-4265029193', shoaibReport.join('\n ------------- \n'), 'Markdown');
  //   }

  //   console.log('🔴', new Date(), functionName, '----> COMPLETED');
  // }

  // async syncMonthReports() {
  //   const functionName = 'syncMonthReports';
  //   console.log('🟢', new Date(), functionName, '----> STARTED');

  //   const documents = await this.googleAdsenseCollection.find({ 'sites.status': 'Ready', error: null, aboToken: { $ne: null } }).toArray();

  //   await Promise.all(
  //     documents.map(async (doc) => {
  //       const { email, pid, cookies, aboToken: token, utc } = doc;
  //       const result = await AdSenseUtils.fetchReportMonth(email, cookies, token, utc, pid);

  //       if (result) {
  //         const { monthReport, report, yesterdayReport } = result;
  //         await this.googleAdsenseCollection.updateOne({ _id: doc._id }, { $set: { monthReport, yesterdayReport, report } });
  //         await this.reportsMonthCollection.insertMany([...report, monthReport]);
  //       }
  //     }),
  //   );

  //   console.log('🔴', new Date(), functionName, '----> COMPLETED');
  // }

  // async syncCountries() {
  //   const functionName = 'syncCountries';
  //   console.log('🟢', new Date(), functionName, '----> STARTED');
  //   const documents = await this.googleAdsenseCollection
  //     .find({ 'sites.status': 'Ready', error: null, ablToken: { $ne: null }, 'information.country': null })
  //     .toArray();

  //   await Promise.all(
  //     documents.map(async (doc) => {
  //       const { email, pid, cookies, ablToken: token } = doc;
  //       const result = await AdSenseUtils.fetchCountry(email, cookies, token, pid);

  //       if (result) {
  //         const { country, currency } = result;
  //         await this.googleAdsenseCollection.updateOne(
  //           { _id: doc._id },
  //           { $set: { 'information.country': country, 'information.currency': currency } },
  //         );
  //       }
  //     }),
  //   );

  //   console.log('🔴', new Date(), functionName, '----> COMPLETED');
  // }

  // async syncUsers() {
  //   const functionName = 'syncUsers';
  //   console.log('🟢', new Date(), functionName, '----> STARTED');

  //   const documents = await this.googleAdsenseCollection.find({ error: null, ablToken: { $ne: null }, 'information.owner': null }).toArray();

  //   await Promise.all(
  //     documents.map(async (doc) => {
  //       const { email, pid, cookies, ablToken: token } = doc;
  //       const owner = await AdSenseUtils.fetchUser(email, cookies, token, pid);

  //       if (owner) {
  //         await this.googleAdsenseCollection.updateOne({ _id: doc._id }, { $set: { 'information.owner': owner } });
  //       }
  //     }),
  //   );

  //   console.log('🔴', new Date(), functionName, '----> COMPLETED');
  // }

  // async syncUTCs() {
  //   const functionName = 'syncUTCs';
  //   console.log('🟢', new Date(), functionName, '----> STARTED');

  //   const documents = await this.googleAdsenseCollection
  //     .find({ 'sites.status': 'Ready', error: null, ablToken: { $ne: null }, 'information.utc': null })
  //     .toArray();

  //   await Promise.all(
  //     documents.map(async (doc) => {
  //       const { email, pid, cookies, ablToken: token } = doc;
  //       const utc = await AdSenseUtils.fetchUTC(email, cookies, token, pid);

  //       if (utc) {
  //         await this.googleAdsenseCollection.updateOne({ _id: doc._id }, { $set: { 'information.utc': utc } });
  //       }
  //     }),
  //   );

  //   console.log('🔴', new Date(), functionName, '----> COMPLETED');
  // }
}
