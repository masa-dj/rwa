import {
    Controller,
    ForbiddenException,
    Get,
    Param,
    UseGuards,
    Request,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { SurgicalEventService } from "./surgical-event.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SessionService } from "../sessions/session.service";

@ApiTags("surgical-events")
@ApiBearerAuth()
@Controller("surgical-events")
@UseGuards(JwtAuthGuard)
export class SurgicalEventController {
    constructor(
        private surgicalEventService: SurgicalEventService,
        private sessionService: SessionService,
    ) {}

    @Get("session/:sessionId")
    async getBySession(
        @Request() req: any,
        @Param("sessionId") sessionId: string,
    ) {
        const session = await this.sessionService.findById(sessionId);
        const isOwner =
            session.studentId === req.user.id ||
            session.supervisorId === req.user.id;
        if (!isOwner) throw new ForbiddenException();
        return this.surgicalEventService.findBySession(sessionId);
    }
}
