// adsense.controller.ts

import { Controller, Get, Query, Param } from '@nestjs/common';
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
    @Query('invite ') invite: string,
  ) {
    return this.adsenseService.getAdsenseData(
      page,
      limit,
      sortBy,
      order,
      invite,
    );
  }

  @Get('summary')
  getAdsenseSummary(@Query('invite ') invite: string) {
    return this.adsenseService.getAdsenseSummary(invite);
  }

  @Get('detail')
  getAdsenseDetail(@Query('pid') pid: string) {
    return this.adsenseService.getAdsenseDetail(pid);
  }
}
