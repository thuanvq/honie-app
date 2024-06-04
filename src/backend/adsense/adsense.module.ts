import { Module } from '@nestjs/common';
import { AdsenseController } from './adsense.controller';
import { AdsenseService } from './adsense.service';
import { MongodbModule } from '../mongodb/mongodb.module';

@Module({
  imports: [MongodbModule],
  providers: [AdsenseService],
  controllers: [AdsenseController],
})
export class AdsenseModule {}
