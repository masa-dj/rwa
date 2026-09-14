import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Exam } from '../models/app.models';
import { ScheduleExamPayload } from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class ExamService {
    private api = 'http://localhost:3000';

    constructor(private http: HttpClient) {}

    schedule(payload: ScheduleExamPayload) {
        return this.http.post<Exam>(`${this.api}/exams`, payload);
    }

    getMine() {
        return this.http.get<Exam[]>(`${this.api}/exams/mine`);
    }

    getAll() {
        return this.http.get<Exam[]>(`${this.api}/exams`);
    }

    openRoom(id: string) {
        return this.http.patch<Exam>(`${this.api}/exams/${id}/open-room`, {});
    }

    getOne(id: string) {
        return this.http.get<Exam>(`${this.api}/exams/${id}`);
    }
}
