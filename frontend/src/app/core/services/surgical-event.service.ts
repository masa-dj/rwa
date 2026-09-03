import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

@Injectable({ providedIn: 'root' })
export class SurgicalEventService {
    private api = 'http://localhost:3000';

    constructor(private http: HttpClient) {}

    getBySession(sessionId: string) {
        return this.http.get<SurgicalEvent[]>(
            `${this.api}/surgical-events/session/${sessionId}`
        );
    }
}
