import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { Exam, ExamStatus } from '../exams/exam.entity';
import { Session } from '../sessions/session.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Exam)
    private examRepository: Repository<Exam>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  async create(supervisorId: string, dto: CreateReportDto): Promise<Report> {
    const exam = await this.examRepository.findOne({ where: { id: dto.examId } });
    if (!exam) throw new NotFoundException(`Exam ${dto.examId} not found`);

    if (exam.supervisorId !== supervisorId) {
      throw new BadRequestException('This exam is not assigned to you');
    }
    if (exam.status !== ExamStatus.COMPLETED) {
      throw new BadRequestException('Exam must be completed before a report can be created');
    }

    const existing = await this.reportRepository.findOne({ where: { examId: dto.examId } });
    if (existing) {
      throw new ConflictException({ message: 'Report already exists for this exam', reportId: existing.id });
    }

    let autoGrade: number | null = null;
    if (exam.sessionId) {
      const session = await this.sessionRepository.findOne({ where: { id: exam.sessionId } });
      autoGrade = session?.score ?? null;
    }

    const report = this.reportRepository.create({ examId: dto.examId, autoGrade });
    return this.reportRepository.save(report);
  }

  async update(id: string, supervisorId: string, dto: UpdateReportDto): Promise<Report> {
    const report = await this.findById(id);
    const exam = await this.examRepository.findOne({ where: { id: report.examId } });

    if (!exam || exam.supervisorId !== supervisorId) {
      throw new BadRequestException('This report is not yours to edit');
    }

    Object.assign(report, dto);
    return this.reportRepository.save(report);
  }

  async findById(id: string): Promise<Report> {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) throw new NotFoundException(`Report ${id} not found`);
    return report;
  }

  async findByExam(examId: string): Promise<Report | null> {
    return this.reportRepository.findOne({ where: { examId } });
  }

  async findAllForSupervisor(supervisorId: string): Promise<Report[]> {
    return this.reportRepository
      .createQueryBuilder('report')
      .innerJoin('exams', 'exam', 'exam.id = report.examId')
      .where('exam.supervisorId = :supervisorId', { supervisorId })
      .orderBy('report.timestamp', 'DESC')
      .getMany();
  }

  async findAllForStudent(studentId: string): Promise<Report[]> {
    return this.reportRepository
      .createQueryBuilder('report')
      .innerJoin('exams', 'exam', 'exam.id = report.examId')
      .where('exam.studentId = :studentId', { studentId })
      .orderBy('report.timestamp', 'DESC')
      .getMany();
  }
}