import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health-check')
  healthCheck() {
    return 'OK';
  }

  @Get('template')
  getTemplate(): any[] {
    return this.appService.getTemplate();
  }

  @Get('dashboard')
  getDashboardRevenue(): any {
    return this.appService.getDashboard();
  }
}
