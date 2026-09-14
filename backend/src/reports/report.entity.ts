import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
} from "typeorm";
import { Exam } from "../exams/exam.entity";

@Entity("reports")
export class Report {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @OneToOne(() => Exam, { onDelete: "CASCADE" })
    @JoinColumn({ name: "examId" })
    exam!: Exam;

    @Column()
    examId!: string;

    @Column({ type: "float", nullable: true })
    autoGrade!: number | null;

    @Column({ type: "float", nullable: true })
    supervisorGrade!: number | null;

    @Column({ type: "text", nullable: true })
    comment!: string | null;

    @Column({ type: "text", nullable: true })
    highlight!: string | null;

    @Column({ default: false })
    recommendsRetry!: boolean;

    @CreateDateColumn()
    timestamp!: Date;
}
