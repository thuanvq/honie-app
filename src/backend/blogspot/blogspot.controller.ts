// adsense.controller.ts

import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BlogspotService } from './blogspot.service';

@Controller('blogspot')
export class BlogspotController {
  constructor(private readonly _service: BlogspotService) {}

  @Get('using')
  async getBlogspotsUsing(
    @Query('page') page: string,
    @Query('rowsPerPage') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('website') website: string,
  ) {
    return this._service.getBlogspotsUsing(page, limit, sortBy, order, website);
  }

  @Get('temp')
  async getBlogspotsTemp(
    @Query('page') page: string,
    @Query('rowsPerPage') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('website') website: string,
  ) {
    return this._service.getBlogspotsTemp(page, limit, sortBy, order, website);
  }

  @Get('unused')
  async getBlogspotsUnused(
    @Query('page') page: string,
    @Query('rowsPerPage') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('website') website: string,
  ) {
    return this._service.getBlogspotsUnused(page, limit, sortBy, order, website);
  }
  @Post('using/off')
  async turnOffBlog(@Query('website') website: string) {
    return this._service.turnOffBlog(website);
  }

  @Get('websites')
  async getWebsites(
    @Query('page') page: string,
    @Query('rowsPerPage') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('name') name: string,
  ) {
    return this._service.getWebsites(page, limit, sortBy, order, name);
  }

  @Post('websites/on')
  async turnOnWebsite(@Query('name') name: string) {
    return this._service.turnOnWebsite(name);
  }

  @Post('websites/off')
  async turnOffWebsite(@Query('name') name: string) {
    return this._service.turnOffWebsite(name);
  }

  @Post('websites')
  async createWebsite(@Body() body: any) {
    return this._service.createWebsite(body);
  }
}
