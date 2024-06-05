// adsense.controller.ts

import { Controller, Get, Post, Query } from '@nestjs/common';
import { AdsenseService } from './adsense.service';

@Controller('adsense')
export class AdsenseController {
  constructor(private readonly adsenseService: AdsenseService) {}

  @Get('using')
  getAdsenseUsing(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('anything') anything: string,
  ) {
    return this.adsenseService.getAdsenseUsing(page, limit, sortBy, order, anything);
  }

  @Get('pantip')
  getAdsensePantip(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('anything') anything: string,
  ) {
    return this.adsenseService.getAdsensePantip(page, limit, sortBy, order, anything);
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
  async getAdsenseWordpress(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('anything') anything: string,
  ) {
    return this.adsenseService.getAdsenseWordpress(page, limit, sortBy, order, anything);
  }

  @Post('wordpress')
  async runAdsenseWordpress(@Query('pid') pid: string) {
    return this.adsenseService.runAdsenseWordpress(pid);
  }
}
