import { Module } from '@nestjs/common';
import { MongoDBService } from '../mongodb/mongodb.service';
import { AdsenseSyncController } from './adsense-sync.controller';
import { AdsenseSyncService } from './adsense-sync.service';

@Module({
  imports: [],
  providers: [AdsenseSyncService, MongoDBService],
  controllers: [AdsenseSyncController],
})
export class AdsenseSyncModule {}
