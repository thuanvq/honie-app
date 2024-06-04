import { Controller, Get } from '@nestjs/common';
import { AdsenseService } from './adsense.service';

@Controller('adsense')
export class AdsenseController {
  constructor(private readonly adsenseService: AdsenseService) {}

  @Get('data')
  async getAdsenseData() {
    return this.adsenseService.getAdsenseData();
  }
}
