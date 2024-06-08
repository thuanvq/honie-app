import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { MongoDBService } from '../mongodb/mongodb.service';
import { AdsenseController } from './adsense.controller';
import { AdsenseService } from './adsense.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 86400, // seconds
      max: 100, // maximum number of items in cache
    }),
  ],
  providers: [AdsenseService, MongoDBService],
  controllers: [AdsenseController],
})
export class AdsenseModule {}
