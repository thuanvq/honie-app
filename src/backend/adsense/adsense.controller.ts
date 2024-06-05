// adsense.controller.ts

import { Controller, Get, Post, Query } from '@nestjs/common';
import { AdsenseService } from './adsense.service';

@Controller('adsense')
export class AdsenseController {
  constructor(private readonly adsenseService: AdsenseService) {}

  @Get('data')
  getAdsenseData(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('invite') invite: string,
  ) {
    return this.adsenseService.getAdsenseData(page, limit, sortBy, order, invite);
  }

  @Get('summary')
  getAdsenseSummary(@Query('invite ') invite: string) {
    return this.adsenseService.getAdsenseSummary(invite);
  }

  @Get('detail')
  getAdsenseDetail(@Query('pid') pid: string) {
    return this.adsenseService.getAdsenseDetail(pid);
  }

  @Get('errors')
  async getErrorAdsense() {
    return this.adsenseService.getErrorAdsenseData();
  }

  @Get('websites')
  async getWebsites(
    @Query('status') status: string,
    @Query('wordpress') wordpress: string,
    @Query('name') name: string,
  ) {
    return this.adsenseService.getWebsites(status, wordpress, name);
  }

  @Get('unused')
  async getUnused(@Query('email') email: string, @Query('site') site: string) {
    return this.adsenseService.getUnused(email, site);
  }

  @Post('run')
  async runAdsense(@Query('pid') pid: string) {
    return this.adsenseService.runAdsense(pid);
  }

  @Get('wordpress')
  async getWebsiteWordpress(@Query('email') email: string, @Query('site') site: string) {
    return this.adsenseService.getWebsiteWordpress(email, site);
  }

  @Post('wordpress')
  async runAdsenseWordpress(@Query('pid') pid: string) {
    return this.adsenseService.runAdsenseWordpress(pid);
  }
}
