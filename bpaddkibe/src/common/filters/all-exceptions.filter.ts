import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { STATUS_CODES } from 'node:http';
import { getPostgresDriverError } from '../utils/db-error.util.js';

interface ErrorBody {
  success: false;
  statusCode: number;
  error: string;
  message: string;
  details?: string[];
  path: string;
  method: string;
  timestamp: string;
  requestId?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    if (response.headersSent) {
      return;
    }

    const { statusCode, message, details } = this.resolveException(exception);

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.originalUrl} -> ${statusCode} (requestId=${request.id ?? '-'})`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ErrorBody = {
      success: false,
      statusCode,
      error: STATUS_CODES[statusCode] ?? 'Error',
      message,
      path: request.originalUrl,
      method: request.method,
      timestamp: new Date().toISOString(),
      requestId: request.id,
    };

    if (details && details.length > 0) {
      body.details = details;
    }

    response.status(statusCode).json(body);
  }

  private resolveException(exception: unknown): {
    statusCode: number;
    message: string;
    details?: string[];
  } {
    if (exception instanceof HttpException) {
      return this.resolveHttpException(exception);
    }

    const postgresError = getPostgresDriverError(exception);

    if (postgresError) {
      switch (postgresError.code) {
        case '23505':
          return {
            statusCode: HttpStatus.CONFLICT,
            message: 'Data dengan nilai unik yang sama sudah terdaftar.',
          };
        case '23503':
          return {
            statusCode: HttpStatus.CONFLICT,
            message:
              'Data masih digunakan oleh data lain sehingga tidak dapat dihapus.',
          };
        case '23502':
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Terdapat data wajib yang belum diisi.',
          };
        case '22P02':
        case '22007':
        case '22008':
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Format data tidak valid.',
          };
        default:
          break;
      }
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Terjadi kesalahan pada server.',
    };
  }

  private resolveHttpException(exception: HttpException): {
    statusCode: number;
    message: string;
    details?: string[];
  } {
    const statusCode = exception.getStatus();
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return { statusCode, message: response };
    }

    if (typeof response !== 'object' || response === null) {
      return { statusCode, message: exception.message };
    }

    const payload = response as Record<string, unknown>;
    const details = this.extractDetails(payload);
    let message = exception.message;

    if (typeof payload.message === 'string') {
      message = payload.message;
    } else if (Array.isArray(payload.message)) {
      message = 'Validasi gagal.';
    }

    if (
      statusCode === HttpStatus.NOT_FOUND &&
      /^Cannot (GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/.test(message)
    ) {
      message = 'Endpoint tidak ditemukan.';
    }

    return { statusCode, message, details };
  }

  private extractDetails(
    payload: Record<string, unknown>,
  ): string[] | undefined {
    if (Array.isArray(payload.errors)) {
      return payload.errors.map((item) => String(item));
    }

    if (Array.isArray(payload.message)) {
      return payload.message.map((item) => String(item));
    }

    return undefined;
  }
}
