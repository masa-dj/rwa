import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SurgicalEvent } from "./surgical-event.entity";
import { SurgicalEventService } from "./surgical-event.service";
import { SurgicalEventController } from "./surgical-event.controller";
import { SessionModule } from "src/sessions/session.module";

@Module({
    imports: [TypeOrmModule.forFeature([SurgicalEvent]), SessionModule],
    providers: [SurgicalEventService],
    controllers: [SurgicalEventController],
    exports: [SurgicalEventService],
})
export class SurgicalEventModule {}
