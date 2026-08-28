import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type SessionMode = 'practice' | 'exam';
export type ExerciseType =
    | 'steady_path'
    | 'timed_suture'
    | 'vessel_cauterization';
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

@Injectable({ providedIn: 'root' })
export class SessionService {
    private api = 'http://localhost:3000';

    constructor(private http: HttpClient) {}

    start(exerciseType: ExerciseType) {
        return this.http.post<Session>(`${this.api}/sessions/start`, {
            mode: 'practice',
            exerciseType,
        });
    }

    complete(
        id: string,
        scores?: {
            precisionScore: number;
            tremorIndex: number;
            score: number;
            reactionTime?: number;
        }
    ) {
        const body = scores ?? {
            precisionScore: 0,
            tremorIndex: 0,
            score: 0,
            reactionTime: 0,
        };
        return this.http.patch<Session>(
            `${this.api}/sessions/${id}/complete`,
            body
        );
    }

    abort(id: string) {
        return this.http.patch<Session>(`${this.api}/sessions/${id}/abort`, {});
    }

    getActive() {
        return this.http.get<Session | null>(`${this.api}/sessions/active`);
    }

    getMine() {
        return this.http.get<Session[]>(`${this.api}/sessions/mine`);
    }

    getSupervised() {
        return this.http.get<Session[]>(`${this.api}/sessions/supervised`);
    }
}
