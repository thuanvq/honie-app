// adsense.controller.ts

import { Controller, Get, Query } from '@nestjs/common';
import { WebsiteService } from './website.service';

@Controller('website')
export class WebsiteController {
  constructor(private readonly adsenseService: WebsiteService) {}

  @Get('ready')
  async getWebsitesReady(
    @Query('page') page: string,
    @Query('rowsPerPage') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('name') name: string,
    @Query('wordpress') wordpress: string,
  ) {
    return this.adsenseService.getWebsites('Ready', page, limit, sortBy, order, name, wordpress);
  }

  @Get('getting-ready')
  async getWebsitesGetting(
    @Query('page') page: string,
    @Query('rowsPerPage') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('name') name: string,
    @Query('wordpress') wordpress: string,
  ) {
    return this.adsenseService.getWebsites('Getting ready', page, limit, sortBy, order, name, wordpress);
  }

  @Get('requires-review')
  async getWebsitesReview(
    @Query('page') page: string,
    @Query('rowsPerPage') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('name') name: string,
    @Query('wordpress') wordpress: string,
  ) {
    return this.adsenseService.getWebsites('Requires review', page, limit, sortBy, order, name, wordpress);
  }

  @Get('needs-attention')
  async getWebsitesAttention(
    @Query('page') page: string,
    @Query('rowsPerPage') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('name') name: string,
    @Query('wordpress') wordpress: string,
  ) {
    return this.adsenseService.getWebsites('Needs attention', page, limit, sortBy, order, name, wordpress);
  }
}
