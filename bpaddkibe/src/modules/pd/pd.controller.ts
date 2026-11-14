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
import { CreatePdDto } from './dto/create-pd.dto.js';
import { QueryPdDto } from './dto/query-pd.dto.js';
import { UpdatePdDto } from './dto/update-pd.dto.js';
import { Pd } from './entities/pd.entity.js';
import { PdService } from './pd.service.js';

@ApiTags('PD')
@ApiSecurity('api-key')
@Controller('pd')
export class PdController {
  constructor(private readonly pdService: PdService) {}

  @Post()
  @ApiOperation({
    summary: 'Tambah Perangkat Daerah',
    description:
      'Membuat data PD baru. Kode PD harus unik (contoh: DISDIK, DINKES, PUPR).',
  })
  @ApiCreatedResponse({ description: 'PD berhasil dibuat.', type: Pd })
  @ApiCommonErrorResponses()
  create(@Body() dto: CreatePdDto): Promise<Pd> {
    return this.pdService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Daftar Perangkat Daerah',
    description:
      'Menampilkan PD dengan pagination, pencarian (kode/nama/singkatan), dan filter status aktif.',
  })
  @ApiPaginatedResponse(Pd, 'Daftar PD berhasil diambil.')
  @ApiCommonErrorResponses()
  findAll(@Query() query: QueryPdDto): Promise<PaginatedResult<Pd>> {
    return this.pdService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detail Perangkat Daerah',
    description:
      'Menampilkan detail PD beserta jumlah PNS dan kendaraan yang terkait.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Detail PD.', type: Pd })
  @ApiCommonErrorResponses()
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Pd> {
    return this.pdService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Ubah Perangkat Daerah' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'PD berhasil diperbarui.', type: Pd })
  @ApiCommonErrorResponses()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePdDto,
  ): Promise<Pd> {
    return this.pdService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Hapus Perangkat Daerah',
    description:
      'Menghapus PD. Penghapusan ditolak (409) jika masih ada PNS atau kendaraan yang terkait.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiNoContentResponse({ description: 'PD berhasil dihapus.' })
  @ApiCommonErrorResponses()
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.pdService.remove(id);
  }
}
