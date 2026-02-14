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

@ApiTags('Groups')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all groups' })
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get group by ID (including students, advisor and co-advisor)',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update group data' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupsService.update(id, updateGroupDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete group' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.delete(id);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish group (isPublished = true)' })
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.publish(id);
  }

  @Patch(':id/unpublish')
  @ApiOperation({ summary: 'Unpublish group (isPublished = false)' })
  unpublish(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.unpublish(id);
  }

  @Post(':id/link-student')
  @ApiOperation({ summary: 'Link student to the group' })
  linkStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LinkStudentDto,
  ) {
    return this.groupsService.linkStudent(id, dto);
  }

  @Delete(':id/unlink-student/:studentId')
  @ApiOperation({ summary: 'Unlink student from the group' })
  unlinkStudent(
    @Param('id', ParseIntPipe) id: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.groupsService.unlinkStudent(id, studentId);
  }

  @Post(':id/link-advisor')
  @ApiOperation({ summary: 'Link main advisor to the group' })
  linkAdvisor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LinkAdvisorDto,
  ) {
    return this.groupsService.linkAdvisor(id, dto);
  }

  @Post(':id/link-co-advisor')
  @ApiOperation({ summary: 'Link co-advisor to the group' })
  linkCoAdvisor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LinkAdvisorDto,
  ) {
    return this.groupsService.linkCoAdvisor(id, dto);
  }

  @Delete(':id/unlink-advisor')
  @ApiOperation({ summary: 'Unlink main advisor from the group' })
  unlinkAdvisor(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.unlinkAdvisor(id);
  }

  @Delete(':id/unlink-co-advisor')
  @ApiOperation({ summary: 'Unlink co-advisor from the group' })
  unlinkCoAdvisor(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.unlinkCoAdvisor(id);
  }

  @Get(':id/students')
  @ApiOperation({ summary: 'List students linked to the group' })
  getGroupStudents(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.getGroupStudents(id);
  }

  @Post(':id/add-student')
  @ApiOperation({
    summary:
      'Add student to the group (can move student if already in another group)',
  })
  addStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LinkStudentDto,
  ) {
    return this.groupsService.addStudentToGroup(id, dto.studentId);
  }
}
