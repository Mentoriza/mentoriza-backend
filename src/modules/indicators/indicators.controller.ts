import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/update-indicator.dto';
import { IndicatorsService } from './indicators.service';

@ApiTags('indicators')
@Controller('indicators')
export class IndicatorsController {
  constructor(private readonly indicatorsService: IndicatorsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo indicador' })
  @ApiResponse({ status: 201, description: 'Indicador criado.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createIndicatorDto: CreateIndicatorDto) {
    return this.indicatorsService.create(createIndicatorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os indicadores' })
  findAll() {
    return this.indicatorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um indicador por ID' })
  @ApiResponse({ status: 404, description: 'Indicador não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.indicatorsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um indicador' })
  @ApiResponse({ status: 404, description: 'Indicador não encontrado.' })
  update(
    @Param('id') id: string,
    @Body() updateIndicatorDto: UpdateIndicatorDto,
  ) {
    return this.indicatorsService.update(+id, updateIndicatorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar um indicador' })
  @ApiResponse({ status: 404, description: 'Indicador não encontrado.' })
  remove(@Param('id') id: string) {
    return this.indicatorsService.remove(+id);
  }
}
