import { SessionMode, ExerciseType } from "../session.entity";

export class StartSessionDto {
    mode!: SessionMode;
    exerciseType!: ExerciseType;
    supervisorId?: string;
}
