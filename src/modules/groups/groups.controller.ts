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

import { AuthGuard } from '../auth/auth.guard';
import { CreateGroupDto } from './dto/create-group.dto';
import { LinkAdvisorDto } from './dto/link-advisor.dto';
import { LinkStudentDto } from './dto/link-student.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsService } from './groups.service';

@ApiTags('Grupos')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo grupo' })
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os grupos' })
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar grupo por ID (com estudantes, advisor e coAdvisor)',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados do grupo' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupsService.update(id, updateGroupDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar grupo' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.delete(id);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publicar grupo (isPublished = true)' })
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.publish(id);
  }

  @Patch(':id/unpublish')
  @ApiOperation({
    summary: 'Remover dos publicados grupo (isPublished = false)',
  })
  unpublish(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.unpublish(id);
  }

  @Post(':id/link-student')
  @ApiOperation({ summary: 'Vincular estudante ao grupo' })
  linkStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LinkStudentDto,
  ) {
    return this.groupsService.linkStudent(id, dto);
  }

  @Delete(':id/unlink-student/:studentId')
  @ApiOperation({ summary: 'Desvincular estudante do grupo' })
  unlinkStudent(
    @Param('id', ParseIntPipe) id: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.groupsService.unlinkStudent(id, studentId);
  }

  @Post(':id/link-advisor')
  @ApiOperation({ summary: 'Vincular orientador principal ao grupo' })
  linkAdvisor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LinkAdvisorDto,
  ) {
    return this.groupsService.linkAdvisor(id, dto);
  }

  @Post(':id/link-co-advisor')
  @ApiOperation({ summary: 'Vincular co-orientador ao grupo' })
  linkCoAdvisor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LinkAdvisorDto,
  ) {
    return this.groupsService.linkCoAdvisor(id, dto);
  }

  @Delete(':id/unlink-advisor')
  @ApiOperation({ summary: 'Desvincular orientador principal do grupo' })
  unlinkAdvisor(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.unlinkAdvisor(id);
  }

  @Delete(':id/unlink-co-advisor')
  @ApiOperation({ summary: 'Desvincular co-orientador do grupo' })
  unlinkCoAdvisor(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.unlinkCoAdvisor(id);
  }

  @Get(':id/students')
  @ApiOperation({ summary: 'Listar estudantes vinculados ao grupo' })
  getGroupStudents(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.getGroupStudents(id);
  }

  @Post(':id/add-student')
  @ApiOperation({
    summary:
      'Adicionar estudante ao grupo (pode trocar se já estiver em outro)',
  })
  addStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LinkStudentDto,
  ) {
    return this.groupsService.addStudentToGroup(id, dto.studentId);
  }
}
