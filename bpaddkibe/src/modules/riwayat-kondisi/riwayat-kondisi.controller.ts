import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../common/decorators/api-common-responses.decorator.js';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator.js';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface.js';
import { CreateRiwayatKondisiDto } from './dto/create-riwayat-kondisi.dto.js';
import { QueryRiwayatKondisiDto } from './dto/query-riwayat-kondisi.dto.js';
import { RiwayatKondisi } from './entities/riwayat-kondisi.entity.js';
import { RiwayatKondisiService } from './riwayat-kondisi.service.js';

@ApiTags('Riwayat Kondisi')
@ApiSecurity('api-key')
@Controller()
export class RiwayatKondisiController {
  constructor(private readonly riwayatKondisiService: RiwayatKondisiService) {}

  @Post('kendaraan/:kendaraanId/riwayat-kondisi')
  @ApiOperation({
    summary: 'Catat kondisi kendaraan',
    description:
      'Mencatat kondisi kendaraan ke riwayat dan sekaligus memperbarui kondisi/status kendaraan. Riwayat bersifat audit dan tidak dapat diubah.',
  })
  @ApiParam({ name: 'kendaraanId', type: Number, example: 1 })
  @ApiCreatedResponse({
    description: 'Riwayat kondisi berhasil dicatat.',
    type: RiwayatKondisi,
  })
  @ApiCommonErrorResponses()
  create(
    @Param('kendaraanId', ParseIntPipe) kendaraanId: number,
    @Body() dto: CreateRiwayatKondisiDto,
  ): Promise<RiwayatKondisi> {
    return this.riwayatKondisiService.create(kendaraanId, dto);
  }

  @Get('kendaraan/:kendaraanId/riwayat-kondisi')
  @ApiOperation({
    summary: 'Riwayat kondisi suatu kendaraan',
    description:
      'Menampilkan riwayat kondisi untuk satu kendaraan dengan pagination dan filter tanggal/kondisi.',
  })
  @ApiParam({ name: 'kendaraanId', type: Number, example: 1 })
  @ApiPaginatedResponse(
    RiwayatKondisi,
    'Riwayat kondisi kendaraan berhasil diambil.',
  )
  @ApiCommonErrorResponses()
  findByKendaraan(
    @Param('kendaraanId', ParseIntPipe) kendaraanId: number,
    @Query() query: QueryRiwayatKondisiDto,
  ): Promise<PaginatedResult<RiwayatKondisi>> {
    return this.riwayatKondisiService.findAll(query, kendaraanId);
  }

  @Get('riwayat-kondisi')
  @ApiOperation({
    summary: 'Daftar seluruh riwayat kondisi',
    description:
      'Menampilkan riwayat kondisi seluruh kendaraan dengan filter kendaraan, kondisi, rentang tanggal, dan pencarian.',
  })
  @ApiPaginatedResponse(
    RiwayatKondisi,
    'Daftar riwayat kondisi berhasil diambil.',
  )
  @ApiCommonErrorResponses()
  findAll(
    @Query() query: QueryRiwayatKondisiDto,
  ): Promise<PaginatedResult<RiwayatKondisi>> {
    return this.riwayatKondisiService.findAll(query);
  }

  @Get('riwayat-kondisi/:id')
  @ApiOperation({ summary: 'Detail riwayat kondisi' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Detail riwayat kondisi.',
    type: RiwayatKondisi,
  })
  @ApiCommonErrorResponses()
  findOne(@Param('id', ParseIntPipe) id: number): Promise<RiwayatKondisi> {
    return this.riwayatKondisiService.findOne(id);
  }
}
