import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type ExerciseType = 'steady_path' | 'timed_suture' | 'vessel_cauterization';
export type ExamStatus = 'scheduled' | 'ready_check' | 'in_progress' | 'completed' | 'aborted' | 'missed';

export interface Exam {
  id: string;
  studentId: string;
  supervisorId: string;
  exerciseType: ExerciseType;
  status: ExamStatus;
  scheduledAt: string;
  sessionId: string | null;
  createdAt: string;
}

export interface ScheduleExamPayload {
  studentId: string;
  exerciseType: ExerciseType;
  scheduledAt: string;
}

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
