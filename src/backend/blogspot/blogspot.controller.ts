// adsense.controller.ts

import { Controller, Get, Query } from '@nestjs/common';
import { BlogspotService } from './blogspot.service';

@Controller('blogspot')
export class BlogspotController {
  constructor(private readonly adsenseService: BlogspotService) {}

  @Get('using')
  async getBlogspotsUsing(
    @Query('page') page: string,
    @Query('rowsPerPage') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('website') website: string,
  ) {
    return this.adsenseService.getBlogspotsUsing(page, limit, sortBy, order, website);
  }

  @Get('temp')
  async getBlogspotsTemp(
    @Query('page') page: string,
    @Query('rowsPerPage') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('website') website: string,
  ) {
    return this.adsenseService.getBlogspotsTemp(page, limit, sortBy, order, website);
  }

  @Get('unused')
  async getBlogspotsUnused(
    @Query('page') page: string,
    @Query('rowsPerPage') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('website') website: string,
  ) {
    return this.adsenseService.getBlogspotsUnused(page, limit, sortBy, order, website);
  }
}
