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
import { AdvisorsService } from './advisors.service';
import { CreateAdvisorDto } from './dto/create-advisor.dto';
import { UpdateAdvisorDto } from './dto/update-advisor.dto';

@ApiTags('Orientadores')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('advisors')
export class AdvisorsController {
  constructor(private readonly advisorsService: AdvisorsService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar novo orientador vinculado a um usuário existente',
  })
  create(@Body() createAdvisorDto: CreateAdvisorDto) {
    return this.advisorsService.create(createAdvisorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os orientadores' })
  findAll() {
    return this.advisorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar orientador por ID (com user)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.advisorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados do orientador' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdvisorDto: UpdateAdvisorDto,
  ) {
    return this.advisorsService.update(id, updateAdvisorDto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({
    summary: 'Desativar orientador (inativa o usuário associado)',
  })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.advisorsService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Ativar orientador (ativa o usuário associado)' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.advisorsService.activate(id);
  }

  @Post(':id/link-user')
  @ApiOperation({ summary: 'Vincular orientador a um usuário (por email)' })
  linkToUser(@Param('id', ParseIntPipe) id: number, @Body() dto: LinkUserDto) {
    return this.advisorsService.linkToUser(id, dto);
  }

  @Delete(':id/unlink-user')
  @ApiOperation({ summary: 'Desvincular orientador do usuário atual' })
  unlinkFromUser(@Param('id', ParseIntPipe) id: number) {
    return this.advisorsService.unlinkFromUser(id);
  }

  @Get(':id/user')
  @ApiOperation({ summary: 'Obter o usuário vinculado ao orientador' })
  getAdvisorUser(@Param('id', ParseIntPipe) id: number) {
    return this.advisorsService.getAdvisorUser(id);
  }

  @Get(':id/groups')
  @ApiOperation({
    summary: 'Obter os grupos orientados e coorientados por este orientador',
  })
  getAdvisedGroups(@Param('id', ParseIntPipe) id: number) {
    return this.advisorsService.getAdvisedGroups(id);
  }
}
