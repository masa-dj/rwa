import { Controller, Get, Post, Patch, Param, Body, Request, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { StartSessionDto } from './dto/start-session.dto';
import { CompleteSessionDto } from './dto/complete-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('sessions')
@ApiBearerAuth()
@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionController {
    constructor(private sessionService: SessionService) {}

    @Post('start')
    start(@Request() req: any, @Body() dto: StartSessionDto) {
        return this.sessionService.start(req.user.id, dto);
    }

    @Patch(':id/complete')
    complete(@Param('id') id: string, @Body() dto: CompleteSessionDto) {
        return this.sessionService.complete(id, dto);
    }

    @Patch(':id/abort')
    abort(@Param('id') id: string) {
        return this.sessionService.abort(id);
    }

    @Get('active')
    getActive(@Request() req: any) {
        return this.sessionService.findActiveForStudent(req.user.id);
    }

    @Get('mine')
    getMine(@Request() req: any) {
        return this.sessionService.findAllForStudent(req.user.id);
    }

    @Get(':id')
    getOne(@Param('id') id: string) {
        return this.sessionService.findById(id);
    }
}