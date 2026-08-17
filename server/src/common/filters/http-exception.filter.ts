import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        message = (resObj.message as string | object) || exception.message;
        error = (resObj.error as string) || exception.name;
      }
    } else if (exception instanceof Error) {
      // Check for MongoDB Duplicate Key Error (code 11000)
      if ((exception as { code?: number }).code === 11000) {
        status = HttpStatus.CONFLICT;
        message = 'Duplicate key error: Resource already exists';
        error = 'Conflict';
      } else if (exception.name === 'CastError') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid identifier format';
        error = 'Bad Request';
      } else if (exception.name === 'ValidationError') {
        status = HttpStatus.BAD_REQUEST;
        message = exception.message;
        error = 'Validation Error';
      } else {
        message =
          process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : exception.message;
      }
    }

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - Status: ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} - Status: ${status} - Message: ${JSON.stringify(message)}`,
      );
    }

    response.status(status).json({
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
