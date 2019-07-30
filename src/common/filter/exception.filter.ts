import {
  ArgumentsHost, Catch, ExceptionFilter, HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

import { Logger } from '@server/shared/logging/logging.service';
import { validator } from '../utils/validator';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  public catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const done = (statusCode: number, message: any, stack?: any) => {
      Logger.error({
        statusCode,
        url: request.url,
        method: request.method,
        // tslint:disable-next-line: object-shorthand-properties-first
        message,
        // tslint:disable-next-line: object-shorthand-properties-first
        stack,
      });
      response
        .status(statusCode)
        .json({
          statusCode,
          message,
        });
    };
    const doneRes = (res: any) => {
      Logger.error({
        url: request.url,
        method: request.method,
        ...res,
      });
      response
        .status(res.statusCode)
        .json(res);
    };
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exRes = exception.getResponse() as any;
      if (validator.isString(exRes)) {
        done(status, exRes);
      } else if (exRes.message) {
        doneRes(exRes);
      } else {
        done(status, exRes.error);
      }
    } else if (exception instanceof QueryFailedError) {
      done(500, exception.message);
    } else {
      done(500, exception.message, exception.stack);
    }
  }
}
