import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SurgicalEvent } from "./surgical-event.entity";
import { CreateSurgicalEventDto } from "./dto/create-surgical-event.dto";

@Injectable()
export class SurgicalEventService {
    constructor(
        @InjectRepository(SurgicalEvent)
        private surgicalEventRepository: Repository<SurgicalEvent>
    ) {}

    async create(
        dto: CreateSurgicalEventDto,
        triggeredBy: string | null
    ): Promise<SurgicalEvent> {
        const event = this.surgicalEventRepository.create({
            sessionId: dto.sessionId,
            type: dto.type,
            x: dto.x ?? null,
            y: dto.y ?? null,
            deviation: dto.deviation ?? null,
            payload: dto.payload ?? null,
            triggeredBy,
        });
        return this.surgicalEventRepository.save(event);
    }

    async findBySession(sessionId: string): Promise<SurgicalEvent[]> {
        return this.surgicalEventRepository.find({
            where: { sessionId },
            order: { timestamp: "ASC" },
        });
    }
}
