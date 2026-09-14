import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../users/user.entity";
import { UsersService } from "../users/user.service";
import { PresenceService } from "./presence.service";

@Controller("presence")
@UseGuards(JwtAuthGuard, RolesGuard)
export class PresenceController {
    constructor(
        private usersService: UsersService,
        private presenceService: PresenceService,
    ) {}

    @Get()
    @Roles(UserRole.SUPERVISOR)
    async getPresence() {
        return this.usersService.findAllWithPresence(
            this.presenceService.getOnlineUserIds(),
        );
    }
}
