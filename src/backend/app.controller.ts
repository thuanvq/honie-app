import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('app')
export class AppController {
  constructor(private readonly _service: AppService) {}

  @Get('health-check')
  healthCheck() {
    return 'OK';
  }

  @Get('template')
  getTemplate(): any[] {
    return this._service.getTemplate();
  }

  @Get('dashboard')
  getDashboardRevenue(): any {
    return this._service.getDashboard();
  }

  @Post('login')
  login(@Body() body: any): any {
    return this._service.login(body);
  }

  @Get('proxy')
  getProxy(): any {
    return this._service.getProxy();
  }

  @Get('check-proxy')
  checkProxy(@Query('proxy') proxy: string): any {
    return this._service.checkProxy(proxy);
  }
}
