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
import { CreateStudentDto } from './dto/create-student.dto';
import { LinkGroupDto } from './dto/link-group.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsService } from './students.service';

@ApiTags('Estudantes')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar novo estudante vinculado a um usuário existente',
  })
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os estudantes' })
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar estudante por ID (com user e group)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados do estudante' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Desativar estudante' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Ativar estudante' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.activate(id);
  }

  @Post(':id/link-group')
  @ApiOperation({ summary: 'Vincular estudante a um grupo' })
  linkToGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LinkGroupDto,
  ) {
    return this.studentsService.linkToGroup(id, dto);
  }

  @Delete(':id/unlink-group')
  @ApiOperation({ summary: 'Desvincular estudante do grupo atual' })
  unlinkFromGroup(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.unlinkFromGroup(id);
  }

  @Get(':id/group')
  @ApiOperation({ summary: 'Obter o grupo vinculado ao estudante' })
  getStudentGroup(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.getStudentGroup(id);
  }

  @ApiOperation({ summary: 'Vincular estudante a um usuário (por email)' })
  linkToUser(@Param('id', ParseIntPipe) id: number, @Body() dto: LinkUserDto) {
    return this.studentsService.linkToUser(id, dto);
  }

  @Delete(':id/unlink-user')
  @ApiOperation({ summary: 'Desvincular estudante do usuário atual' })
  unlinkFromUser(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.unlinkFromUser(id);
  }

  @Post(':id/change-group')
  @ApiOperation({
    summary: 'Trocar ou vincular estudante a um grupo (envia email)',
  })
  changeGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LinkGroupDto,
  ) {
    return this.studentsService.changeGroup(id, dto.groupId);
  }
}
