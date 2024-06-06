import { Controller, Get, Query } from '@nestjs/common';
import { AdsenseService } from './adsense-sync.service';

@Controller('adsense-sync')
export class AdsenseSyncController {
  constructor(private readonly adsenseService: AdsenseService) {}

  @Get('refetch-sites')
  syncSite(@Query('pid') pid: string) {
    return this.adsenseService.syncSite(pid);
  }
  @Get('refetch-today')
  syncToday(@Query('pid') pid: string) {
    return this.adsenseService.syncToday(pid);
  }
  @Get('refetch-month')
  syncMonth(@Query('pid') pid: string) {
    return this.adsenseService.syncMonth(pid);
  }
  @Get('all')
  syncAll(@Query('pid') pid: string) {
    return this.adsenseService.syncAll(pid);
  }

  // @Get('syncSites')
  // syncSites(): string {
  //   this.adsenseService.syncSites();
  //   return 'syncSites triggered';
  // }

  // @Get('syncTodayReports')
  // syncTodayReports(): string {
  //   this.adsenseService.syncTodayReports();
  //   return 'syncTodayReports triggered';
  // }

  // @Get('syncMonthReports')
  // syncMonthReports(): string {
  //   this.adsenseService.syncMonthReports();
  //   return 'syncMonthReports triggered';
  // }

  // @Get('syncCountries')
  // syncCountries(): string {
  //   this.adsenseService.syncCountries();
  //   return 'syncCountries triggered';
  // }

  // @Get('syncUsers')
  // syncUsers(): string {
  //   this.adsenseService.syncUsers();
  //   return 'syncUsers triggered';
  // }

  // @Get('syncUTCs')
  // syncUTCs(): string {
  //   this.adsenseService.syncUTCs();
  //   return 'syncUTCs triggered';
  // }
}
