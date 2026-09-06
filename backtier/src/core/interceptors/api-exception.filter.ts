import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const raw = exception.getResponse();

      let message = exception.message;
      if (typeof raw === 'string') {
        message = raw;
      } else if (raw && typeof raw === 'object' && 'message' in raw) {
        const rawMessage = (raw as { message?: string | string[] }).message;
        if (Array.isArray(rawMessage)) {
          message = rawMessage.join(', ');
        } else if (typeof rawMessage === 'string') {
          message = rawMessage;
        }
      }

      response.status(statusCode).json({
        success: false,
        statusCode,
        timestamp: new Date().toISOString(),
        path: request.url,
        error: message,
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      error:
        exception instanceof Error
          ? exception.message
          : 'Internal server error',
    });
  }
}
