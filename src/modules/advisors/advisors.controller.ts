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

@ApiTags('Advisors')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('advisors')
export class AdvisorsController {
  constructor(private readonly advisorsService: AdvisorsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new advisor linked to an existing user',
  })
  create(@Body() createAdvisorDto: CreateAdvisorDto) {
    return this.advisorsService.create(createAdvisorDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all advisors' })
  findAll() {
    return this.advisorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get advisor by ID (including user)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.advisorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update advisor data' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdvisorDto: UpdateAdvisorDto,
  ) {
    return this.advisorsService.update(id, updateAdvisorDto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({
    summary: 'Deactivate advisor (deactivates the associated user)',
  })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.advisorsService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate advisor (activates the associated user)' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.advisorsService.activate(id);
  }

  @Post(':id/link-user')
  @ApiOperation({ summary: 'Link advisor to a user (by email)' })
  linkToUser(@Param('id', ParseIntPipe) id: number, @Body() dto: LinkUserDto) {
    return this.advisorsService.linkToUser(id, dto);
  }

  @Delete(':id/unlink-user')
  @ApiOperation({ summary: 'Unlink advisor from the current user' })
  unlinkFromUser(@Param('id', ParseIntPipe) id: number) {
    return this.advisorsService.unlinkFromUser(id);
  }

  @Get(':id/user')
  @ApiOperation({ summary: 'Get the user linked to this advisor' })
  getAdvisorUser(@Param('id', ParseIntPipe) id: number) {
    return this.advisorsService.getAdvisorUser(id);
  }

  @Get(':id/groups')
  @ApiOperation({
    summary: 'Get groups advised or co-advised by this advisor',
  })
  getAdvisedGroups(@Param('id', ParseIntPipe) id: number) {
    return this.advisorsService.getAdvisedGroups(id);
  }
}
