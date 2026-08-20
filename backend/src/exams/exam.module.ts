import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exam } from './exam.entity';
import { Session } from '../sessions/session.entity';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { SessionModule } from '../sessions/session.module';

@Module({
    imports: [TypeOrmModule.forFeature([Exam, Session]), SessionModule],
    providers: [ExamService],
    controllers: [ExamController],
    exports: [ExamService],
})
export class ExamModule {}