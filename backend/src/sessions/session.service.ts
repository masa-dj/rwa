import {
    Injectable,
    ConflictException,
    NotFoundException,
    BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Session, SessionMode, SessionStatus } from "./session.entity";
import { StartSessionDto } from "./dto/start-session.dto";
import { CompleteSessionDto } from "./dto/complete-session.dto";

@Injectable()
export class SessionService {
    constructor(
        @InjectRepository(Session)
        private sessionRepository: Repository<Session>,
    ) {}

    async start(studentId: string, dto: StartSessionDto): Promise<Session> {
        const existing = await this.sessionRepository.findOne({
            where: { studentId, status: SessionStatus.IN_PROGRESS },
        });
        if (existing) {
            throw new ConflictException({
                message: "An attempt is already in progress",
                sessionId: existing.id,
            });
        }

        if (dto.mode === SessionMode.EXAM && !dto.supervisorId) {
            throw new BadRequestException(
                "supervisorId is required for exam sessions",
            );
        }

        const session = this.sessionRepository.create({
            studentId,
            mode: dto.mode,
            exerciseType: dto.exerciseType,
            supervisorId:
                dto.mode === SessionMode.EXAM ? dto.supervisorId : null,
            status: SessionStatus.IN_PROGRESS,
        });

        return this.sessionRepository.save(session);
    }

    async complete(id: string, dto: CompleteSessionDto): Promise<Session> {
        const session = await this.findById(id);
        if (session.status !== SessionStatus.IN_PROGRESS) {
            throw new BadRequestException(
                `Session is already ${session.status}`,
            );
        }

        session.status = SessionStatus.COMPLETED;
        session.endTime = new Date();
        session.precisionScore = dto.precisionScore;
        session.tremorIndex = dto.tremorIndex;
        session.reactionTime = dto.reactionTime ?? null;
        session.score = dto.score;

        return this.sessionRepository.save(session);
    }

    async finish(id: string): Promise<Session> {
        const session = await this.findById(id);
        if (session.status !== SessionStatus.IN_PROGRESS) {
            throw new BadRequestException(
                `Session is already ${session.status}`,
            );
        }
        session.status = SessionStatus.COMPLETED;
        session.endTime = new Date();
        return this.sessionRepository.save(session);
    }

    async abort(id: string): Promise<Session> {
        const session = await this.findById(id);
        if (session.status !== SessionStatus.IN_PROGRESS) {
            throw new BadRequestException(
                `Session is already ${session.status}`,
            );
        }

        session.status = SessionStatus.ABORTED;
        session.endTime = new Date();

        return this.sessionRepository.save(session);
    }

    async findById(id: string): Promise<Session> {
        const session = await this.sessionRepository.findOne({ where: { id } });
        if (!session) throw new NotFoundException(`Session ${id} not found`);
        return session;
    }

    async findActiveForStudent(studentId: string): Promise<Session | null> {
        return this.sessionRepository.findOne({
            where: { studentId, status: SessionStatus.IN_PROGRESS },
        });
    }

    async findAllForStudent(studentId: string): Promise<Session[]> {
        return this.sessionRepository.find({
            where: { studentId },
            order: { startTime: "DESC" },
        });
    }

    async findAllForSupervisor(supervisorId: string): Promise<Session[]> {
        return this.sessionRepository.find({
            where: { supervisorId, mode: SessionMode.EXAM },
            order: { startTime: "DESC" },
        });
    }
}
