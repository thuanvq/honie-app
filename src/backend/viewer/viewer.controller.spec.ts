import { Test, TestingModule } from '@nestjs/testing';
import { ViewerController } from './viewer.controller';
import { MongodbService } from '../mongodb/mongodb.service';

describe('ViewerController', () => {
  let controller: ViewerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ViewerController],
      providers: [MongodbService],
    }).compile();

    controller = module.get<ViewerController>(ViewerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
