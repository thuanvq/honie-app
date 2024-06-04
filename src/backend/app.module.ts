import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongodbModule } from './mongodb/mongodb.module';
import { ViewerController } from './viewer/viewer.controller';
import { MongodbService } from './mongodb/mongodb.service';
import { ViewerService } from './viewer/viewer.service';
import { AdsenseController } from './adsense/adsense.controller';
import { AdsenseModule } from './adsense/adsense.module';

@Module({
  imports: [AdsenseModule],
  controllers: [ViewerController],
  providers: [MongodbService, ViewerService],
})
export class AppModule {}
