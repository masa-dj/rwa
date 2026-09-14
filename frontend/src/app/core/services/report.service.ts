import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Report, UpdateReportPayload } from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class ReportService {
    private api = 'http://localhost:3000';

    constructor(private http: HttpClient) {}

    create(examId: string) {
        return this.http.post<Report>(`${this.api}/reports`, { examId });
    }

    update(id: string, payload: UpdateReportPayload) {
        return this.http.patch<Report>(`${this.api}/reports/${id}`, payload);
    }

    getMine() {
        return this.http.get<Report[]>(`${this.api}/reports/mine`);
    }

    getByExam(examId: string) {
        return this.http.get<Report | null>(
            `${this.api}/reports/by-exam/${examId}`
        );
    }

    getOne(id: string) {
        return this.http.get<Report>(`${this.api}/reports/${id}`);
    }
}
