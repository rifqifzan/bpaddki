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
import { CreatePnsDto } from './dto/create-pns.dto.js';
import { QueryPnsDto } from './dto/query-pns.dto.js';
import { UpdatePnsDto } from './dto/update-pns.dto.js';
import { Pns } from './entities/pns.entity.js';
import { PnsService } from './pns.service.js';

@ApiTags('PNS')
@ApiSecurity('api-key')
@Controller('pns')
export class PnsController {
  constructor(private readonly pnsService: PnsService) {}

  @Post()
  @ApiOperation({
    summary: 'Tambah PNS',
    description:
      'Membuat data PNS. NIP harus unik dan terdiri dari 18 digit. PNS wajib terhubung ke PD.',
  })
  @ApiCreatedResponse({ description: 'PNS berhasil dibuat.', type: Pns })
  @ApiCommonErrorResponses()
  create(@Body() dto: CreatePnsDto): Promise<Pns> {
    return this.pnsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Daftar PNS',
    description:
      'Menampilkan PNS dengan pagination, pencarian (nama/NIP/jabatan), filter PD, golongan, dan status aktif.',
  })
  @ApiPaginatedResponse(Pns, 'Daftar PNS berhasil diambil.')
  @ApiCommonErrorResponses()
  findAll(@Query() query: QueryPnsDto): Promise<PaginatedResult<Pns>> {
    return this.pnsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detail PNS',
    description: 'Menampilkan detail PNS beserta data PD tempat bertugas.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Detail PNS.', type: Pns })
  @ApiCommonErrorResponses()
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Pns> {
    return this.pnsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Ubah PNS' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'PNS berhasil diperbarui.', type: Pns })
  @ApiCommonErrorResponses()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePnsDto,
  ): Promise<Pns> {
    return this.pnsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Hapus PNS',
    description:
      'Menghapus PNS. Penghapusan ditolak (409) jika PNS memiliki riwayat penugasan; gunakan aktif=false untuk menonaktifkan.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiNoContentResponse({ description: 'PNS berhasil dihapus.' })
  @ApiCommonErrorResponses()
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.pnsService.remove(id);
  }
}
