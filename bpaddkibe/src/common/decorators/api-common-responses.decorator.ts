import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiErrorDto } from '../dto/api-error.dto.js';

/**
 * Documents the error responses shared by all protected endpoints.
 */
export function ApiCommonErrorResponses() {
  return applyDecorators(
    ApiBadRequestResponse({
      description: 'Payload/query parameter tidak valid.',
      type: ApiErrorDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Header X-API-Key tidak dikirim atau tidak valid.',
      type: ApiErrorDto,
    }),
    ApiNotFoundResponse({
      description: 'Data tidak ditemukan.',
      type: ApiErrorDto,
    }),
    ApiConflictResponse({
      description: 'Terjadi konflik data, misalnya duplikat atau relasi aktif.',
      type: ApiErrorDto,
    }),
    ApiTooManyRequestsResponse({
      description: 'Batas permintaan per menit terlampaui.',
      type: ApiErrorDto,
    }),
    ApiInternalServerErrorResponse({
      description: 'Kesalahan tak terduga pada server.',
      type: ApiErrorDto,
    }),
  );
}
