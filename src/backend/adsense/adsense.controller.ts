import { Controller, Get, Query } from '@nestjs/common';
import { AdsenseService } from './adsense.service';

@Controller('adsense')
export class AdsenseController {
  constructor(private readonly adsenseService: AdsenseService) {}

  @Get('data')
  getData(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
  ) {
    const pageNum = parseInt(page, 100) || 1;
    const limitNum = parseInt(limit, 100) || 100;
    return this.adsenseService.getAdsenseData(pageNum, limitNum, sortBy, order);
  }
}
