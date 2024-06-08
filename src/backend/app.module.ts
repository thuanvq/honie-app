import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AdsenseSyncModule } from './adsense-sync/adsense-sync.module';
import { AdsenseModule } from './adsense/adsense.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogspotModule } from './blogspot/blogspot.module';
import { GmailModule } from './gmail/gmail.module';
import { LoggingInterceptor } from './logging.interceptor';
import { MongoDBModule } from './mongodb/mongodb.module';
import { MongoDBService } from './mongodb/mongodb.service';
import { WebsiteModule } from './website/website.module';

@Module({
  imports: [
    AdsenseModule,
    MongoDBModule,
    WebsiteModule,
    BlogspotModule,
    AdsenseSyncModule,
    GmailModule,
    CacheModule.register({
      ttl: 86400, // seconds
      max: 100, // maximum number of items in cache
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MongoDBService,
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
