import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../common/decorators/api-common-responses.decorator.js';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator.js';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface.js';
import { CreatePenugasanDto } from './dto/create-penugasan.dto.js';
import { QueryPenugasanDto } from './dto/query-penugasan.dto.js';
import { UpdatePenugasanDto } from './dto/update-penugasan.dto.js';
import { PenugasanKendaraan } from './entities/penugasan-kendaraan.entity.js';
import { PenugasanService } from './penugasan.service.js';

@ApiTags('Penugasan Kendaraan')
@ApiSecurity('api-key')
@Controller('penugasan')
export class PenugasanController {
  constructor(private readonly penugasanService: PenugasanService) {}

  @Post()
  @ApiOperation({
    summary: 'Tugaskan kendaraan kepada PNS',
    description:
      'Mencatat pegawai yang bertanggung jawab/mengemudikan kendaraan. Satu kendaraan hanya boleh memiliki satu penanggung jawab aktif. Status kendaraan otomatis menjadi DIGUNAKAN.',
  })
  @ApiCreatedResponse({
    description: 'Penugasan berhasil dibuat.',
    type: PenugasanKendaraan,
  })
  @ApiCommonErrorResponses()
  create(@Body() dto: CreatePenugasanDto): Promise<PenugasanKendaraan> {
    return this.penugasanService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Daftar penugasan',
    description:
      'Menampilkan penugasan dengan pagination, filter kendaraan, PNS, status, dan peran.',
  })
  @ApiPaginatedResponse(
    PenugasanKendaraan,
    'Daftar penugasan berhasil diambil.',
  )
  @ApiCommonErrorResponses()
  findAll(
    @Query() query: QueryPenugasanDto,
  ): Promise<PaginatedResult<PenugasanKendaraan>> {
    return this.penugasanService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detail penugasan',
    description: 'Menampilkan detail penugasan beserta kendaraan dan PNS.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Detail penugasan.',
    type: PenugasanKendaraan,
  })
  @ApiCommonErrorResponses()
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PenugasanKendaraan> {
    return this.penugasanService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Ubah/akhiri penugasan',
    description:
      'Memperbarui penugasan. Kirim status "SELESAI" untuk mengakhiri penugasan; status kendaraan otomatis dikembalikan ke TERSEDIA/PERBAIKAN.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Penugasan berhasil diperbarui.',
    type: PenugasanKendaraan,
  })
  @ApiCommonErrorResponses()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePenugasanDto,
  ): Promise<PenugasanKendaraan> {
    return this.penugasanService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Hapus penugasan',
    description: 'Menghapus data penugasan dan menyinkronkan status kendaraan.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiNoContentResponse({ description: 'Penugasan berhasil dihapus.' })
  @ApiCommonErrorResponses()
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.penugasanService.remove(id);
  }
}
