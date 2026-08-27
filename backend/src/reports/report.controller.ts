import { Controller, Get, Post, Patch, Param, Body, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERVISOR)
  create(@Request() req: any, @Body() dto: CreateReportDto) {
    return this.reportService.create(req.user.id, dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERVISOR)
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateReportDto) {
    return this.reportService.update(id, req.user.id, dto);
  }

  @Get('mine')
  getMine(@Request() req: any) {
    if (req.user.role === 'supervisor') {
      return this.reportService.findAllForSupervisor(req.user.id);
    }
    return this.reportService.findAllForStudent(req.user.id);
  }

  @Get('by-exam/:examId')
  getByExam(@Param('examId') examId: string) {
    return this.reportService.findByExam(examId);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.reportService.findById(id);
  }
}