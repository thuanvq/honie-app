import { Controller, Get, Query } from '@nestjs/common';
import { GmailService } from './gmail.service';

@Controller('gmail')
export class GmailController {
  constructor(private readonly gmailService: GmailService) {}

  @Get('messages')
  async getMessages(): Promise<string[]> {
    try {
      const messages = await this.gmailService.findInvitation();
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
    @Query('to') to: string,
  ) {
    return this.gmailService.getInbox(to);
  }

  @Get('otp')
  async getOtp(
    @Query('page') page: string,
    @Query('rowsPerPage') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('to') to: string,
  ) {
    return this.gmailService.getInbox(to, 'OTP');
  }

  @Get('adsense')
  async getAdsense(
    @Query('page') page: string,
    @Query('rowsPerPage') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
    @Query('to') to: string,
  ) {
    return this.gmailService.getInbox(to, 'Adsense');
  }

  @Get('inbox/detail')
  async getEmail(@Query('id') id: string) {
    return this.gmailService.getEmail(id);
  }
}
