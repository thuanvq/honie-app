// adsense.controller.ts

import { Controller, Get, Post, Query } from '@nestjs/common';
import { AdsenseService } from './adsense.service';

@Controller('adsense')
export class AdsenseController {
  constructor(private readonly adsenseService: AdsenseService) {}

  @Get('using')
  getAdsenseUsing(
    @Query('page') page: string,
    @Query('rowsPerPage') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('anything') anything: string,
  ) {
    return this.adsenseService.getAdsenseUsing(page, limit, sortBy, order, anything);
  }

  @Get('pantip')
  getAdsensePantip(
    @Query('page') page: string,
    @Query('rowsPerPage') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('anything') anything: string,
  ) {
    return this.adsenseService.getAdsensePantip(page, limit, sortBy, order, anything);
  }

  @Get('errors')
  async getAdsenseError(
    @Query('page') page: string,
    @Query('rowsPerPage') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('anything') anything: string,
  ) {
    return this.adsenseService.getAdsenseError(page, limit, sortBy, order, anything);
  }

  @Get('unused')
  async getAdsenseUnused(
    @Query('page') page: string,
    @Query('rowsPerPage') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('anything') anything: string,
  ) {
    return this.adsenseService.getAdsenseUnused(page, limit, sortBy, order, anything);
  }

  @Get('wordpress')
  async getAdsenseWordpress(
    @Query('page') page: string,
    @Query('rowsPerPage') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('anything') anything: string,
  ) {
    return this.adsenseService.getAdsenseWordpress(page, limit, sortBy, order, anything);
  }

  @Get('detail')
  getAdsenseDetail(@Query('pid') pid: string) {
    return this.adsenseService.getAdsenseDetail(pid);
  }

  @Get('websites')
  async getWebsites(@Query('status') status: string, @Query('wordpress') wordpress: string, @Query('name') name: string) {
    return this.adsenseService.getWebsites(status, wordpress, name);
  }

  @Post(['wordpress', 'unused'])
  async addBlogspot(@Query('pid') pid: string) {
    return this.adsenseService.addBlogspot(pid);
  }
  @Post(['using', 'pantip'])
  async stopBlogspot(@Query('pid') pid: string) {
    return this.adsenseService.stopBlogspot(pid);
  }
}
