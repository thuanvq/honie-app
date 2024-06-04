import { Module } from '@nestjs/common';
import { ViewerService } from './viewer.service';
import { ViewerController } from './viewer.controller';
import { MongodbModule } from '../mongodb/mongodb.module';

@Module({
  imports: [MongodbModule],
  providers: [ViewerService],
  controllers: [ViewerController],
})
export class ViewerModule {}
