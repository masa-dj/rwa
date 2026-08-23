import { ExerciseType } from '../../sessions/session.entity';

export class ScheduleExamDto {
    studentId!: string;
    exerciseType!: ExerciseType;
    scheduledAt!: string;
}