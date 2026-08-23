import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exam } from './exam.entity';
import { Session } from '../sessions/session.entity';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { SessionModule } from '../sessions/session.module';
import { ExamGateway } from './exam.gateway';
import { ExamRoomService } from './exam-room.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [TypeOrmModule.forFeature([Exam, Session]), SessionModule,JwtModule.register({ secret: process.env.JWT_SECRET ?? 'dev-secret' }),],
    providers: [ExamService, ExamGateway, ExamRoomService],
    controllers: [ExamController],
    exports: [ExamService],
})
export class ExamModule {}