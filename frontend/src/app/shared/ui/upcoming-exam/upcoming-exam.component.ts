import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Exam } from '../../../core/models/app.models';
import { AuthService } from '../../../core/services/auth.service';
import * as ExamActions from '../../../state/exams/exam.actions';
import { selectUpcomingExams } from '../../../state/exams/exam.selectors';
import { ExamsState } from '../../../state/exams/exam.reducer';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

interface AppState {
    exams: ExamsState;
}

@Component({
    selector: 'app-upcoming-exam',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './upcoming-exam.component.html',
    styleUrls: ['./upcoming-exam.component.scss'],
})
export class UpcomingExamComponent implements OnInit {
    isSupervisor = false;
    upcomingExams$: Observable<Exam[]>;

    exerciseLabels: Record<string, string> = {
        steady_path: 'Steady Path',
        timed_suture: 'Timed Suture',
        vessel_cauterization: 'Vessel Cauterization',
    };

    constructor(
        private authService: AuthService,
        private store: Store<AppState>,
    ) {
        this.upcomingExams$ = this.store.select(selectUpcomingExams);
    }

    ngOnInit() {
        this.isSupervisor = this.authService.getUser()?.role === 'supervisor';
        this.store.dispatch(ExamActions.loadExams());
    }
}
