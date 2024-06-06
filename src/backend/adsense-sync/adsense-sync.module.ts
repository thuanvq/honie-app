import { Module } from '@nestjs/common';
import { MongoDBService } from '../mongodb/mongodb.service';
import { AdsenseSyncController } from './adsense-sync.controller';
import { AdsenseService } from './adsense-sync.service';

@Module({
  imports: [],
  providers: [AdsenseService, MongoDBService],
  controllers: [AdsenseSyncController],
})
export class AdsenseSyncModule {}
