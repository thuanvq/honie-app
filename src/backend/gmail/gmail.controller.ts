import { Controller, Get, Query } from '@nestjs/common';
import { GmailService } from './gmail.service';

@Controller('gmail')
export class GmailController {
  constructor(private readonly gmailService: GmailService) {}

  @Get(['inbox/refetch', 'otp/refetch', 'adsense/refetch'])
  async fetchMail(): Promise<string[]> {
    try {
      const messages = await this.gmailService.fetchMail();
      return messages;
    } catch (error) {
      return [`Error: ${error.message}`];
    }
  }

  @Get('inbox')
  async getInbox(
    @Query('page') page: string,
    @Query('rowsPerPage') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('anything') anything: string,
  ) {
    return this.gmailService.getInbox(anything);
  }

  @Get('otp')
  async getOtp(
    @Query('page') page: string,
    @Query('rowsPerPage') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('anything') anything: string,
  ) {
    return this.gmailService.getInbox(anything, 'OTP');
  }

  @Get('adsense')
  async getAdsense(
    @Query('page') page: string,
    @Query('rowsPerPage') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('anything') anything: string,
  ) {
    return this.gmailService.getInbox(anything, 'Adsense');
  }

  @Get('inbox/detail')
  async getEmail(@Query('id') id: string) {
    return this.gmailService.getEmail(id);
  }
}
