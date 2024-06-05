export const COUNTRY_CODE: Record<string, string> = {
  Australia: 'AU',
  Canada: 'CA',
  France: 'FR',
  Germany: 'GE',
  India: 'IN',
  'United Kingdom': 'UK',
  'United States': 'US',
  Vietnam: 'VN',
};

export type LIST_RESPONSE = {
  title: string;
  headers: any[];
  data: any[];
  filters: any[];
  totalRecords: number;
  summary: string;
};

export const ADSENSE_SORT = {
  today: 'todayReport.estimatedEarnings',
  rpm: 'todayReport.pageRPM',
  views: 'todayReport.pageViews',
  impressions: 'todayReport.impressions',
  clicks: 'todayReport.clicks',
  updated: 'todayReport.updatedAt',
  yesterday: 'yesterdayReport.estimatedEarnings',
  month: 'monthReport.estimatedEarnings',
  limit: 'information.limit',
  country: 'information.country',
  utc: 'information.utc',
  owner: 'information.owner',
  currency: 'information.currency',
};
export const READY_PANTIP = { sites: { $elemMatch: { name: /pantip.com/, status: 'Ready' } } };
export const READY_WORDPRESS = { sites: { $elemMatch: { name: { $not: /pantip.com|minigame.vip|html5gameportal.com/ }, status: 'Ready' } } };
