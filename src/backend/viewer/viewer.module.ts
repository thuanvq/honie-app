import { Module } from '@nestjs/common';
import { MongoDBService } from '../mongodb/mongodb.service';
import { ViewerController } from './viewer.controller';
import { ViewerService } from './viewer.service';

@Module({
  imports: [],
  providers: [ViewerService, MongoDBService],
  controllers: [ViewerController],
})
export class ViewerModule {}
