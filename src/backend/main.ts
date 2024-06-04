import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const nestApp = await NestFactory.create(AppModule);
  nestApp.enableCors({
    origin: '*', // Allow requests from file protocol
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept',
  });
  await nestApp.listen(3000);
}
bootstrap();
