import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SurgicalEvent } from '../models/app.models';
import { APP_CONFIG } from '../config/app-config';

@Injectable({ providedIn: 'root' })
export class SurgicalEventService {
    private api = APP_CONFIG.apiUrl;

    constructor(private http: HttpClient) {}

    getBySession(sessionId: string) {
        return this.http.get<SurgicalEvent[]>(
            `${this.api}/surgical-events/session/${sessionId}`
        );
    }
}
