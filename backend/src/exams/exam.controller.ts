import { Controller, Get, Post, Patch, Param, Body, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ExamService } from './exam.service';
import { ScheduleExamDto } from './dto/schedule-exam.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CompleteExamDto } from './dto/complete-exam.dto';

@ApiTags('exams')
@ApiBearerAuth()
@Controller('exams')
@UseGuards(JwtAuthGuard)
export class ExamController {
    constructor(private examService: ExamService) {}

    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPERVISOR)
    schedule(@Request() req: any, @Body() dto: ScheduleExamDto) {
        return this.examService.schedule(req.user.id, dto);
    }

    @Patch(':id/start')
    start(@Request() req: any, @Param('id') id: string) {
        return this.examService.start(id, req.user.id);
    }

    @Get('mine')
    getMine(@Request() req: any) {
        if (req.user.role === 'supervisor') {
        return this.examService.findAllForSupervisor(req.user.id);
        }
        return this.examService.findAllForStudent(req.user.id);
    }

    @Get()
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPERVISOR)
    getAll() {
        return this.examService.findAll();
    }

    @Get(':id')
    getOne(@Param('id') id: string) {
        return this.examService.findById(id);
    }

    @Patch(':id/complete')
    complete(@Param('id') id: string, @Body() dto: CompleteExamDto) {
        return this.examService.complete(id, dto);
    }

    @Patch(':id/abort')
    abort(@Param('id') id: string) {
        return this.examService.abort(id);
    }
}