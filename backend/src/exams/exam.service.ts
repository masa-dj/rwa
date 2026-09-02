import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Exam, ExamStatus } from './exam.entity';
import { Session, SessionMode, SessionStatus } from '../sessions/session.entity';
import { ScheduleExamDto } from './dto/schedule-exam.dto';
import { SessionService } from '../sessions/session.service';
import { CompleteExamDto } from './dto/complete-exam.dto';

@Injectable()
export class ExamService {
    constructor(
        @InjectRepository(Exam)
        private examRepository: Repository<Exam>,
        @InjectRepository(Session)
        private sessionRepository: Repository<Session>,
        private sessionService: SessionService,
    ) {}

    //find
    async findById(id: string): Promise<Exam> {
        const exam = await this.examRepository.findOne({ where: { id } });
        if (!exam) throw new NotFoundException(`Exam ${id} not found`);
        return exam;
    }

    async findAllForStudent(studentId: string): Promise<Exam[]> {
        await this.sweepMissedExams();
        return this.examRepository.find({
            where: { studentId },
            order: { scheduledAt: 'DESC' },
        });
    }

    async findAllForSupervisor(supervisorId: string): Promise<Exam[]> {
        await this.sweepMissedExams();
        return this.examRepository.find({
            where: { supervisorId },
            relations: ['student'],
            order: { scheduledAt: 'DESC' },
        });
    }

    async findAll(): Promise<Exam[]> {
        await this.sweepMissedExams();
        return this.examRepository.find({
            relations: ['student'],
            order: { scheduledAt: 'DESC' },
        });
    }

    //exam
    async schedule(supervisorId: string, dto: ScheduleExamDto): Promise<Exam> {
        const exam = this.examRepository.create({
            studentId: dto.studentId,
            supervisorId,
            exerciseType: dto.exerciseType,
            scheduledAt: new Date(dto.scheduledAt),
            status: ExamStatus.SCHEDULED,
        });
        return this.examRepository.save(exam);
    }

    async start(examId: string, studentId: string): Promise<Exam> {
        const exam = await this.findById(examId);

        if (exam.studentId !== studentId) {
            throw new BadRequestException('This exam is not assigned to you');
        }
        if (exam.status !== ExamStatus.READY_CHECK) {
            throw new BadRequestException(`Exam is already ${exam.status}`);
        }

        const activeSession = await this.sessionRepository.findOne({
            where: { studentId, status: SessionStatus.IN_PROGRESS },
        });
        if (activeSession) {
            throw new ConflictException({
                message: 'An attempt is already in progress',
                sessionId: activeSession.id,
            });
        }

        const session = this.sessionRepository.create({
            studentId,
            supervisorId: exam.supervisorId,
            mode: SessionMode.EXAM,
            exerciseType: exam.exerciseType,
            status: SessionStatus.IN_PROGRESS,
        });
        const savedSession = await this.sessionRepository.save(session);

        exam.sessionId = savedSession.id;
        exam.status = ExamStatus.IN_PROGRESS;
        return this.examRepository.save(exam);
    }

    async complete(examId: string, dto: CompleteExamDto): Promise<Exam> {
        const exam = await this.findById(examId);

        if (exam.status !== ExamStatus.IN_PROGRESS) {
            throw new BadRequestException(`Exam is already ${exam.status}`);
        }
        if (!exam.sessionId) {
            throw new BadRequestException('Exam has no active session to complete');
        }

        await this.sessionService.complete(exam.sessionId, dto);

        exam.status = ExamStatus.COMPLETED;
        return this.examRepository.save(exam);
    }

    async abort(examId: string): Promise<Exam> {
        const exam = await this.findById(examId);

        if (exam.status !== ExamStatus.IN_PROGRESS) {
            throw new BadRequestException(`Exam is already ${exam.status}`);
        }
        if (!exam.sessionId) {
            throw new BadRequestException('Exam has no active session to abort');
        }

        await this.sessionService.abort(exam.sessionId);

        exam.status = ExamStatus.ABORTED;
        return this.examRepository.save(exam);
    }

    async finish(examId: string): Promise<Exam> {
        const exam = await this.findById(examId);
        if (exam.status !== ExamStatus.IN_PROGRESS) {
            throw new BadRequestException(`Exam is already ${exam.status}`);
        }
        if (!exam.sessionId) {
            throw new BadRequestException('Exam has no active session to finish');
        }

        await this.sessionService.finish(exam.sessionId);
        exam.status = ExamStatus.COMPLETED;
        return this.examRepository.save(exam);
    }

    async openRoom(examId: string, supervisorId: string): Promise<Exam> {
        const exam = await this.findById(examId);
        if (exam.supervisorId !== supervisorId) {
            throw new BadRequestException('This exam is not assigned to you');
        }
        if (exam.status !== ExamStatus.SCHEDULED) {
            throw new BadRequestException(`Exam is already ${exam.status}`);
        }

        const earliest = new Date(exam.scheduledAt.getTime() - 15 * 60 * 1000);
        if (new Date() < earliest) {
            throw new BadRequestException('Too early to open the exam room');
        }

        exam.status = ExamStatus.READY_CHECK;
        exam.roomOpenedAt = new Date();
        return this.examRepository.save(exam);
    }

    private async sweepMissedExams(): Promise<void> {
        const cutoff = new Date(Date.now() - 15 * 60 * 1000);
        const staleExams = await this.examRepository.find({
            where: { status: ExamStatus.SCHEDULED, scheduledAt: LessThan(cutoff) },
        });

        if (staleExams.length === 0) return;

        staleExams.forEach((exam) => (exam.status = ExamStatus.MISSED));
        await this.examRepository.save(staleExams);
    }
}