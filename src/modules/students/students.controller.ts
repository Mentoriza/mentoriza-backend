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

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new student linked to an existing user',
  })
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all students' })
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student by ID (including user and group)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update student data' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate student' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate student' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.activate(id);
  }

  @Post(':id/link-group')
  @ApiOperation({ summary: 'Link student to a group' })
  linkToGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LinkGroupDto,
  ) {
    return this.studentsService.linkToGroup(id, dto);
  }

  @Delete(':id/unlink-group')
  @ApiOperation({ summary: 'Unlink student from the current group' })
  unlinkFromGroup(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.unlinkFromGroup(id);
  }

  @Get(':id/group')
  @ApiOperation({ summary: 'Get the group linked to the student' })
  getStudentGroup(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.getStudentGroup(id);
  }

  @Post(':id/link-user')
  @ApiOperation({ summary: 'Link student to a user (by email)' })
  linkToUser(@Param('id', ParseIntPipe) id: number, @Body() dto: LinkUserDto) {
    return this.studentsService.linkToUser(id, dto);
  }

  @Delete(':id/unlink-user')
  @ApiOperation({ summary: 'Unlink student from the current user' })
  unlinkFromUser(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.unlinkFromUser(id);
  }

  @Post(':id/change-group')
  @ApiOperation({
    summary: 'Change or link student to a group (sends email)',
  })
  changeGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LinkGroupDto,
  ) {
    return this.studentsService.changeGroup(id, dto.groupId);
  }
}
