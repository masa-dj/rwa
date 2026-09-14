import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SurgicalEvent } from '../models/app.models';

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
