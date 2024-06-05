import { Module } from '@nestjs/common';
import { MongoDBService } from '../mongodb/mongodb.service';
import { AdsenseController } from './adsense.controller';
import { AdsenseService } from './adsense.service';

@Module({
  imports: [],
  providers: [AdsenseService, MongoDBService],
  controllers: [AdsenseController],
})
export class AdsenseModule {}
