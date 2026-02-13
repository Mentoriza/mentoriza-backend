import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { LinkUserDto } from 'src/common/dto/link-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CoordinatorsService } from './coordinators.service';
import { CreateCoordinatorDto } from './dto/create-coordinator.dto';
import { UpdateCoordinatorDto } from './dto/update-coordinator.dto';

@ApiTags('Coordenadores')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('coordinators')
export class CoordinatorsController {
  constructor(private readonly coordinatorsService: CoordinatorsService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar novo coordenador vinculado a um usuário existente',
  })
  create(@Body() createCoordinatorDto: CreateCoordinatorDto) {
    return this.coordinatorsService.create(createCoordinatorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os coordenadores' })
  findAll() {
    return this.coordinatorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar coordenador por ID (com user)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coordinatorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados do coordenador' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCoordinatorDto: UpdateCoordinatorDto,
  ) {
    return this.coordinatorsService.update(id, updateCoordinatorDto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({
    summary: 'Desativar coordenador (inativa o usuário associado)',
  })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.coordinatorsService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Ativar coordenador (ativa o usuário associado)' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.coordinatorsService.activate(id);
  }

  @Post(':id/link-user')
  @ApiOperation({ summary: 'Vincular coordenador a um usuário (por email)' })
  linkToUser(@Param('id', ParseIntPipe) id: number, @Body() dto: LinkUserDto) {
    return this.coordinatorsService.linkToUser(id, dto);
  }

  @Delete(':id/unlink-user')
  @ApiOperation({ summary: 'Desvincular coordenador do usuário atual' })
  unlinkFromUser(@Param('id', ParseIntPipe) id: number) {
    return this.coordinatorsService.unlinkFromUser(id);
  }

  @Get(':id/user')
  @ApiOperation({ summary: 'Obter o usuário vinculado ao coordenador' })
  getCoordinatorUser(@Param('id', ParseIntPipe) id: number) {
    return this.coordinatorsService.getCoordinatorUser(id);
  }
}
