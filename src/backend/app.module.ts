import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongodbModule } from './mongodb/mongodb.module';
import { ViewerController } from './viewer/viewer.controller';
import { MongodbService } from './mongodb/mongodb.service';
import { ViewerService } from './viewer/viewer.service';
import { AdsenseController } from './adsense/adsense.controller';
import { AdsenseModule } from './adsense/adsense.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingMiddleware } from './logging.middleware';

@Module({
  imports: [AdsenseModule],
  controllers: [ViewerController],
  providers: [
    MongodbService,
    ViewerService,
    { provide: APP_INTERCEPTOR, useClass: LoggingMiddleware },
  ],
})
export class AppModule {}
