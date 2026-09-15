import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from "typeorm";
import { Session } from "../sessions/session.entity";

@Entity("surgical_events")
export class SurgicalEvent {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Session, { onDelete: "CASCADE" })
    @JoinColumn({ name: "sessionId" })
    session!: Session;

    @Column()
    sessionId!: string;

    @Column()
    type!: string;

    @Column({ type: "float", nullable: true })
    x!: number | null;

    @Column({ type: "float", nullable: true })
    y!: number | null;

    @Column({ type: "float", nullable: true })
    deviation!: number | null;

    @Column({ type: "jsonb", nullable: true })
    payload!: Record<string, any> | null;

    @Column({ type: "varchar", nullable: true })
    triggeredBy!: string | null;

    @CreateDateColumn()
    timestamp!: Date;
}
