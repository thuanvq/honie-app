// adsense.controller.ts

import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AdsenseService } from './adsense.service';

@Controller('adsense')
export class AdsenseController {
  constructor(private readonly adsenseService: AdsenseService) {}

  @Get('ready')
  getAdsenseUsing(
    @Query('page') page: string,
    @Query('rowsPerPage') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('anything') anything: string,
  ) {
    return this.adsenseService.getAdsenseReady(page, limit, sortBy, order, anything);
  }

  @Get('running')
  getAdsenseRunning(
    @Query('page') page: string,
    @Query('rowsPerPage') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('anything') anything: string,
  ) {
    return this.adsenseService.getAdsenseRunning(page, limit, sortBy, order, anything);
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

  @Get('error')
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

  @Post(['wordpress', 'unused'])
  async addBlogspot(@Query('pid') pid: string) {
    return this.adsenseService.addBlogspot(pid);
  }
  @Post(['ready', 'pantip', 'running'])
  async stopBlogspot(@Query('pid') pid: string) {
    return this.adsenseService.stopBlogspot(pid);
  }
  @Post('error')
  async setAdsenseError(@Query('pid') pid: string, @Body('message') message: string) {
    return this.adsenseService.setAdsenseError(pid, message);
  }
}
