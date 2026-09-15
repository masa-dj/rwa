export interface Point {
    x: number;
    y: number;
}

export interface AppUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: 'pending' | 'approved' | 'rejected';
}

export type ExerciseType =
    | 'steady_path'
    | 'timed_suture'
    | 'vessel_cauterization';

export type ExamStatus =
    | 'scheduled'
    | 'ready_check'
    | 'in_progress'
    | 'completed'
    | 'aborted'
    | 'missed';

export interface Exam {
    id: string;
    studentId: string;
    supervisorId: string;
    exerciseType: ExerciseType;
    status: ExamStatus;
    scheduledAt: string;
    sessionId: string | null;
    createdAt: string;
    student?: { id: string; firstName: string; lastName: string; email: string };
}

export interface ScheduleExamPayload {
    studentId: string;
    exerciseType: ExerciseType;
    scheduledAt: string;
}

export interface PresenceUser {
    id: string;
    name: string;
    status: 'active' | 'offline';
    lastSeenAt: string | null;
}

export interface Report {
    id: string;
    examId: string;
    autoGrade: number | null;
    supervisorGrade: number | null;
    comment: string | null;
    highlight: string | null;
    recommendsRetry: boolean;
    timestamp: string;
}

export interface UpdateReportPayload {
    supervisorGrade?: number;
    comment?: string;
    highlight?: string;
    recommendsRetry?: boolean;
}

export type SessionMode = 'practice' | 'exam';

export type SessionStatus = 'in_progress' | 'completed' | 'aborted';

export interface Session {
    id: string;
    mode: SessionMode;
    exerciseType: ExerciseType;
    status: SessionStatus;
    studentId: string;
    supervisorId: string | null;
    precisionScore: number | null;
    tremorIndex: number | null;
    reactionTime: number | null;
    score: number | null;
    startTime: string;
    endTime: string | null;
}

export interface SurgicalEvent {
    id: string;
    sessionId: string;
    type: string;
    x: number | null;
    y: number | null;
    deviation: number | null;
    payload: Record<string, any> | null;
    triggeredBy: string | null;
    timestamp: string;
}
