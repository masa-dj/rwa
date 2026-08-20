import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from "typeorm";
import { User } from "../users/user.entity";

export enum SessionMode {
    PRACTICE = "practice",
    EXAM = "exam",
}

export enum ExerciseType {
    STEADY_PATH = "steady_path",
    TIMED_SUTURE = "timed_suture",
    VESSEL_CAUTERIZATION = "vessel_cauterization",
}

export enum SessionStatus {
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    ABORTED = "aborted",
}

@Entity("sessions")
export class Session {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "enum", enum: SessionMode })
    mode!: SessionMode;

    @Column({ type: "enum", enum: ExerciseType })
    exerciseType!: ExerciseType;

    @Column({
        type: "enum",
        enum: SessionStatus,
        default: SessionStatus.IN_PROGRESS,
    })
    status!: SessionStatus;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "studentId" })
    student!: User;

    @Column()
    studentId!: string;

    //in case the mode is pratice, no supervisor should be able to access this session
    @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "supervisorId" })
    supervisor!: User | null;

    @Column({ nullable: true })
    supervisorId!: string | null;

    @Column({ type: "float", nullable: true })
    precisionScore!: number | null;

    @Column({ type: "float", nullable: true })
    tremorIndex!: number | null;

    @Column({ type: "float", nullable: true })
    reactionTime!: number | null;

    @Column({ type: "float", nullable: true })
    score!: number | null;

    @CreateDateColumn()
    startTime!: Date;

    @Column({ type: "timestamp", nullable: true })
    endTime!: Date | null;
}
