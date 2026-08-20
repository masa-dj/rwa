import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Session, ExerciseType } from '../sessions/session.entity';

export enum ExamStatus {
    SCHEDULED = 'scheduled',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    ABORTED = 'aborted',
    MISSED = 'missed',
}

@Entity('exams')
export class Exam {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'studentId' })
    student!: User;

    @Column()
    studentId!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'supervisorId' })
    supervisor!: User;

    @Column()
    supervisorId!: string;

    @Column({ type: 'enum', enum: ExerciseType })
    exerciseType!: ExerciseType;

    @Column({ type: 'enum', enum: ExamStatus, default: ExamStatus.SCHEDULED })
    status!: ExamStatus;

    @Column({ type: 'timestamp' })
    scheduledAt!: Date;

    @OneToOne(() => Session, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'sessionId' })
    session!: Session | null;

    @Column({ nullable: true })
    sessionId!: string | null;

    @CreateDateColumn()
    createdAt!: Date;
}