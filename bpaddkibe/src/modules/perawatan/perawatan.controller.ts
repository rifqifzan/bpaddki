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
import { CreatePerawatanDto } from './dto/create-perawatan.dto.js';
import { QueryPerawatanDto } from './dto/query-perawatan.dto.js';
import { UpdatePerawatanDto } from './dto/update-perawatan.dto.js';
import { Perawatan } from './entities/perawatan.entity.js';
import { PerawatanService } from './perawatan.service.js';

@ApiTags('Perawatan')
@ApiSecurity('api-key')
@Controller('perawatan')
export class PerawatanController {
  constructor(private readonly perawatanService: PerawatanService) {}

  @Post()
  @ApiOperation({
    summary: 'Tambah catatan perawatan',
    description:
      'Mencatat servis/perbaikan kendaraan. Jika odometer lebih tinggi dari data kendaraan, odometer kendaraan ikut diperbarui.',
  })
  @ApiCreatedResponse({
    description: 'Perawatan berhasil dibuat.',
    type: Perawatan,
  })
  @ApiCommonErrorResponses()
  create(@Body() dto: CreatePerawatanDto): Promise<Perawatan> {
    return this.perawatanService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Daftar perawatan',
    description:
      'Menampilkan perawatan dengan pagination, filter kendaraan, jenis, status, rentang tanggal, dan pencarian.',
  })
  @ApiPaginatedResponse(Perawatan, 'Daftar perawatan berhasil diambil.')
  @ApiCommonErrorResponses()
  findAll(
    @Query() query: QueryPerawatanDto,
  ): Promise<PaginatedResult<Perawatan>> {
    return this.perawatanService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail perawatan' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Detail perawatan.', type: Perawatan })
  @ApiCommonErrorResponses()
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Perawatan> {
    return this.perawatanService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Ubah catatan perawatan' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Perawatan berhasil diperbarui.',
    type: Perawatan,
  })
  @ApiCommonErrorResponses()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePerawatanDto,
  ): Promise<Perawatan> {
    return this.perawatanService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus catatan perawatan' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiNoContentResponse({ description: 'Perawatan berhasil dihapus.' })
  @ApiCommonErrorResponses()
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.perawatanService.remove(id);
  }
}
