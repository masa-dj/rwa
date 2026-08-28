import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SurgicalEvent } from "./surgical-event.entity";
import { SurgicalEventService } from "./surgical-event.service";
import { SurgicalEventController } from "./surgical-event.controller";

@Module({
    imports: [TypeOrmModule.forFeature([SurgicalEvent])],
    providers: [SurgicalEventService],
    controllers: [SurgicalEventController],
    exports: [SurgicalEventService],
})
export class SurgicalEventModule {}
