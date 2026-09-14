import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PresenceGateway } from "./presence.gateway";
import { PresenceService } from "./presence.service";
import { PresenceController } from "./presence.controller";
import { UsersModule } from "../users/user.module";

@Module({
    imports: [
        UsersModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET ?? "dev-secret",
        }),
    ],
    providers: [PresenceGateway, PresenceService],
    controllers: [PresenceController],
})
export class PresenceModule {}
