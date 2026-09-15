import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ExerciseType, Session } from '../models/app.models';
import { APP_CONFIG } from '../config/app-config';

@Injectable({ providedIn: 'root' })
export class SessionService {
    private api = APP_CONFIG.apiUrl;

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
