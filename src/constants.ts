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

export type LIST_RESPONSE = { title: string; headers: any[]; data: any[]; filters: any[]; totalRecords: number };

export const SORT_FIELDS = {
  today: 'todayReport.estimatedEarnings',
  rpm: 'todayReport.pageRPM',
  views: 'todayReport.pageViews',
  impressions: 'todayReport.impressions',
  updated: 'todayReport.updatedAt',
  clicks: 'todayReport.clicks',
  yesterday: 'yesterdayReport.estimatedEarnings',
  month: 'monthReport.estimatedEarnings',
  limit: 'information.limit',
  country: 'information.country',
  utc: 'information.utc',
  owner: 'information.owner',
  currency: 'information.currency',
};
