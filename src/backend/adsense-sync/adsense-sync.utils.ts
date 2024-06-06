// import axios from 'axios';
import { getDateTime } from '../../utils';
import { UNUSED_RESPONSE, UTC, WEBSITE_STATUS } from './adsense-sync.constants';
const qs = require('qs');
const axios = require('axios').default;

export class AdSenseUtils {
  static async fetchSites(email: string, cookies: string, token: string, pid: string) {
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://www.google.com/display-ads-frontend-publisher-center/services/_/rpc/SiteManagementService/ListSites?host=adsense',
      headers: {
        cookie: cookies,
        'x-framework-xsrf-token': token,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: qs.stringify({ 'f.req': '{"1":2,"2":1,"3":2}' }),
    };

    try {
      const response = await axios(config);
      const data = JSON.parse(response.data?.replace(UNUSED_RESPONSE, ''));
      const sites = data['1'].map((x) => ({
        name: x['1'],
        status: WEBSITE_STATUS[x['2']],
        email,
        pid,
        fetchedAt: new Date(),
      }));
      console.table(sites);
      return { sites };
    } catch (e) {
      console.log('❌', new Date(), email, e.response?.status);
      return null;
    }
  }

  static async fetchTodayReport(email: string, cookies: string, token: string, pid: string) {
    const { date, time } = getDateTime(7);
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://www.google.com/adsense/service/reporting/GenerateReport?ov=3',
      headers: {
        cookie: cookies,
        'x-framework-xsrf-token': token,
        'content-type': 'application/json;charset=UTF-8',
      },
      data: '{"1":{"2":1},"2":{"1":{"6":[44],"9":[{"2":23,"3":true}],"14":[23,3,26,216,222,16,29,18]},"2":{"1":5,"2":[23],"5":false}},"4":1,"5":"USD"}',
    };

    try {
      const response = await axios(config);
      const data = JSON.parse(response.data?.replace(UNUSED_RESPONSE, ''));
      const all = data['1']['6']['3']['2'];
      const list = data['1']['6']['2'];

      const todayReport = {
        estimatedEarnings: all[0],
        pageViews: all[1],
        pageRPM: all[2],
        impressions: all[3],
        impressionRPM: all[4],
        clicks: all[5],
        cpc: all[6],
        pageCTR: all[7],
        updatedAt: `${date} ${time}`,
        email,
        pid,
        fetchedAt: new Date(),
      };
      const siteReport = list.map((x) => {
        const site = x['1'][0];
        const r = x['2'];
        return {
          site,
          estimatedEarnings: r[0],
          pageViews: r[1],
          pageRPM: r[2],
          impressions: r[3],
          impressionRPM: r[4],
          clicks: r[5],
          cpc: r[6],
          pageCTR: r[7],
          updatedAt: `${date} ${time}`,
          email,
          pid,
          fetchedAt: new Date(),
        };
      });

      if (siteReport.length > 0) console.table(siteReport);
      return { todayReport, siteReport };
    } catch (e) {
      console.log('❌', new Date(), email, e.response?.status);
      return null;
    }
  }

  static async fetchReportMonth(email: string, cookies: string, token: string, utc: number, pid: string) {
    const { date, time } = getDateTime(7);
    let { date: yesterday } = getDateTime(utc - 24);
    yesterday = yesterday.replace(/-/g, '');
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://www.google.com/adsense/service/reporting/GenerateReport?ov=3',
      headers: {
        cookie: cookies,
        'x-framework-xsrf-token': token,
        'content-type': 'application/json;charset=UTF-8',
      },
      data: '{"1":{"2":6},"2":{"1":{"6":[1],"9":[{"1":1,"3":false}],"14":[23,3,26,216,222,16,29,18]},"2":{"1":1,"2":[23],"5":false}},"4":1,"5":"USD"}',
    };

    try {
      const response = await axios(config);
      const data = JSON.parse(response.data?.replace(UNUSED_RESPONSE, ''));
      const all = data['1']['6']['3']['2'];
      const list = data['1']['6']['2'];

      const monthReport = {
        estimatedEarnings: all[0],
        pageViews: all[1],
        pageRPM: all[2],
        impressions: all[3],
        impressionRPM: all[4],
        clicks: all[5],
        cpc: all[6],
        pageCTR: all[7],
        updatedAt: `${date} ${time}`,
        email,
        pid,
        fetchedAt: new Date(),
      };
      const report = list.map((x) => {
        const date = x['1'][0];
        const r = x['2'];
        return {
          date,
          estimatedEarnings: r[0],
          pageViews: r[1],
          pageRPM: r[2],
          impressions: r[3],
          impressionRPM: r[4],
          clicks: r[5],
          cpc: r[6],
          pageCTR: r[7],
          updatedAt: `${date} ${time}`,
          email,
          pid,
          fetchedAt: new Date(),
        };
      });
      if (report.length > 0) console.table(report);
      const yesterdayReport = report.find((r) => r.date === yesterday);
      return { monthReport, report, yesterdayReport };
    } catch (e) {
      console.log('❌', new Date(), email, e);
      return null;
    }
  }

  static async fetchCountry(email: string, cookies: string, token: string, pid: string) {
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://www.google.com/display-ads-frontend-publisher-center/services/_/rpc/PaymentsService/ListBillingProfiles?host=adsense',
      headers: {
        cookie: cookies,
        'x-framework-xsrf-token': token,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: qs.stringify({ 'f.req': '{}' }),
    };

    try {
      const response = await axios(config);
      const data = JSON.parse(response.data?.replace(UNUSED_RESPONSE, ''));
      const firstAcc = data['4'][0];
      const country = firstAcc['5'];
      const currency = firstAcc['6'];
      return { country, currency, email, pid, fetchedAt: new Date() };
    } catch (e) {
      console.log('❌', new Date(), email, e.response?.status);
      return null;
    }
  }

  static async fetchUser(email: string, cookies: string, token: string, pid: string) {
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://www.google.com/display-ads-frontend-publisher-center/services/_/rpc/UserManagementService/ListUsers?host=adsense',
      headers: {
        cookie: cookies,
        'x-framework-xsrf-token': token,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: qs.stringify({ 'f.req': '{}' }),
    };

    try {
      const response = await axios(config);
      const data = JSON.parse(response.data?.replace(UNUSED_RESPONSE, ''));
      const users = data['1'];
      const owner = users
        .filter((u) => !u['2'].includes('minori.com.vn'))
        .map((u) => u['2'])
        .join(',');
      return owner;
    } catch (e) {
      console.log('❌', new Date(), email, e.response?.status);
      return null;
    }
  }

  static async fetchUTC(email: string, cookies: string, token: string, pid: string) {
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://www.google.com/adsense/service/settings/GetAccountInformation',
      headers: {
        cookie: cookies,
        'x-framework-xsrf-token': token,
        'Content-Type': 'application/json;charset=UTF-8',
      },
      data: '{}',
    };

    try {
      const response = await axios(config);
      const data = JSON.parse(response.data?.replace(UNUSED_RESPONSE, ''));
      const utc = UTC[data['3']];
      return utc;
    } catch (e) {
      console.log('❌', new Date(), email, e.response?.status);
      return null;
    }
  }
}

export function formatMessageToTable(data) {
  return `PID: ${data.pid}
Email: ${data.email}
Estimated Earnings: ${data.estimatedEarnings} $
Page Views: ${data.pageViews}`;
}
