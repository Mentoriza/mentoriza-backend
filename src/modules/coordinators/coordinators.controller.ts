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

@ApiTags('Coordinators')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('coordinators')
export class CoordinatorsController {
  constructor(private readonly coordinatorsService: CoordinatorsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new coordinator linked to an existing user',
  })
  create(@Body() createCoordinatorDto: CreateCoordinatorDto) {
    return this.coordinatorsService.create(createCoordinatorDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all coordinators' })
  findAll() {
    return this.coordinatorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get coordinator by ID (including user)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coordinatorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update coordinator data' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCoordinatorDto: UpdateCoordinatorDto,
  ) {
    return this.coordinatorsService.update(id, updateCoordinatorDto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({
    summary: 'Deactivate coordinator (deactivates the associated user)',
  })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.coordinatorsService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({
    summary: 'Activate coordinator (activates the associated user)',
  })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.coordinatorsService.activate(id);
  }

  @Post(':id/link-user')
  @ApiOperation({ summary: 'Link coordinator to a user (by email)' })
  linkToUser(@Param('id', ParseIntPipe) id: number, @Body() dto: LinkUserDto) {
    return this.coordinatorsService.linkToUser(id, dto);
  }

  @Delete(':id/unlink-user')
  @ApiOperation({ summary: 'Unlink coordinator from the current user' })
  unlinkFromUser(@Param('id', ParseIntPipe) id: number) {
    return this.coordinatorsService.unlinkFromUser(id);
  }

  @Get(':id/user')
  @ApiOperation({ summary: 'Get the user linked to this coordinator' })
  getCoordinatorUser(@Param('id', ParseIntPipe) id: number) {
    return this.coordinatorsService.getCoordinatorUser(id);
  }
}
