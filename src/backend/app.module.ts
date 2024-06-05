import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AdsenseModule } from './adsense/adsense.module';
import { LoggingInterceptor } from './logging.interceptor';
import { MongoDBModule } from './mongodb/mongodb.module';
import { ViewerController } from './viewer/viewer.controller';
import { ViewerService } from './viewer/viewer.service';

@Module({
  imports: [AdsenseModule, MongoDBModule],
  controllers: [ViewerController],
  providers: [
    ViewerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer;
    // .apply(LoggingMiddleware)
    // .forRoutes('*');
  }
}
