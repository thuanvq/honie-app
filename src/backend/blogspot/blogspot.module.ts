import { Module } from '@nestjs/common';
import { MongoDBService } from '../mongodb/mongodb.service';
import { BlogspotController } from './blogspot.controller';
import { BlogspotService } from './blogspot.service';

@Module({
  imports: [],
  providers: [BlogspotService, MongoDBService],
  controllers: [BlogspotController],
})
export class BlogspotModule {}
