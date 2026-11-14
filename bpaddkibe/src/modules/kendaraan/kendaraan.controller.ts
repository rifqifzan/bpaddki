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
import { CreateKendaraanDto } from './dto/create-kendaraan.dto.js';
import { QueryKendaraanDto } from './dto/query-kendaraan.dto.js';
import { StatistikKendaraanDto } from './dto/statistik-kendaraan.dto.js';
import { UpdateKendaraanDto } from './dto/update-kendaraan.dto.js';
import { Kendaraan } from './entities/kendaraan.entity.js';
import { KendaraanService } from './kendaraan.service.js';

@ApiTags('Kendaraan')
@ApiSecurity('api-key')
@Controller('kendaraan')
export class KendaraanController {
  constructor(private readonly kendaraanService: KendaraanService) {}

  @Post()
  @ApiOperation({
    summary: 'Tambah kendaraan dinas',
    description:
      'Mendaftarkan kendaraan. Nopol dinormalisasi otomatis (contoh: b1234xyz menjadi "B 1234 XYZ"). Kondisi awal otomatis dicatat pada riwayat kondisi.',
  })
  @ApiCreatedResponse({
    description: 'Kendaraan berhasil dibuat.',
    type: Kendaraan,
  })
  @ApiCommonErrorResponses()
  create(@Body() dto: CreateKendaraanDto): Promise<Kendaraan> {
    return this.kendaraanService.create(dto);
  }

  @Get('statistik')
  @ApiOperation({
    summary: 'Statistik kendaraan',
    description:
      'Ringkasan jumlah kendaraan per kondisi/status, kendaraan yang perlu perhatian, dan pajak kedaluwarsa.',
  })
  @ApiOkResponse({
    description: 'Statistik kendaraan.',
    type: StatistikKendaraanDto,
  })
  @ApiCommonErrorResponses()
  statistik(): Promise<StatistikKendaraanDto> {
    return this.kendaraanService.statistik();
  }

  @Get()
  @ApiOperation({
    summary: 'Daftar kendaraan',
    description:
      'Menampilkan kendaraan dengan pagination, pencarian (nopol/merek/tipe/warna), filter kondisi, status, PD, dan tahun.',
  })
  @ApiPaginatedResponse(Kendaraan, 'Daftar kendaraan berhasil diambil.')
  @ApiCommonErrorResponses()
  findAll(
    @Query() query: QueryKendaraanDto,
  ): Promise<PaginatedResult<Kendaraan>> {
    return this.kendaraanService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detail kendaraan',
    description:
      'Menampilkan detail kendaraan, PD pengelola, penugasan aktif, dan riwayat kondisi terbaru.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Detail kendaraan.', type: Kendaraan })
  @ApiCommonErrorResponses()
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Kendaraan> {
    return this.kendaraanService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Ubah kendaraan',
    description:
      'Memperbarui data kendaraan. Jika kondisi berubah, riwayat kondisi otomatis ditambahkan.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Kendaraan berhasil diperbarui.',
    type: Kendaraan,
  })
  @ApiCommonErrorResponses()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateKendaraanDto,
  ): Promise<Kendaraan> {
    return this.kendaraanService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Hapus kendaraan',
    description:
      'Menghapus kendaraan. Penghapusan ditolak (409) jika masih ada penugasan aktif.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiNoContentResponse({ description: 'Kendaraan berhasil dihapus.' })
  @ApiCommonErrorResponses()
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.kendaraanService.remove(id);
  }
}
