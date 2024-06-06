import { Module } from '@nestjs/common';
import { MongoDBService } from '../mongodb/mongodb.service';
import { WebsiteController } from './website.controller';
import { WebsiteService } from './website.service';

@Module({
  imports: [],
  providers: [WebsiteService, MongoDBService],
  controllers: [WebsiteController],
})
export class WebsiteModule {}
