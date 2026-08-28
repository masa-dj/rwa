import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { SurgicalEventService } from "./surgical-event.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("surgical-events")
@ApiBearerAuth()
@Controller("surgical-events")
@UseGuards(JwtAuthGuard)
export class SurgicalEventController {
    constructor(private surgicalEventService: SurgicalEventService) {}

    @Get("session/:sessionId")
    getBySession(@Param("sessionId") sessionId: string) {
        return this.surgicalEventService.findBySession(sessionId);
    }
}
