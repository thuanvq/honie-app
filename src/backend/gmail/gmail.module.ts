import { Module } from '@nestjs/common';
import { MongoDBService } from '../mongodb/mongodb.service';
import { GmailController } from './gmail.controller';
import { GmailService } from './gmail.service';

@Module({
  imports: [],
  providers: [GmailService, MongoDBService],
  exports: [GmailService],
  controllers: [GmailController],
})
export class GmailModule {}
