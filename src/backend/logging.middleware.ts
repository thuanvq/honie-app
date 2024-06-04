import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    console.log(`API Path: ${req.path}`);
    console.log(`Request Body:`, req.body);
    next();
  }
}
