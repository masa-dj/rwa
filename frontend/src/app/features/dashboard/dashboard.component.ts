import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ActivityLogComponent } from '../supervisor/activity-log/activity-log.component';
import { SidebarComponent } from '../../shared/ui/sidebar/sidebar.component';
import { CalendarComponent } from '../../shared/ui/calendar/calendar.component';
import { UpcomingExamComponent } from '../../shared/ui/upcoming-exam/upcoming-exam.component';
import { Exam } from '../../core/models/app.models';
import * as ExamActions from '../../state/exams/exam.actions';
import { selectAllExamsSorted } from '../../state/exams/exam.selectors';
import { ExamsState } from '../../state/exams/exam.reducer';
import { Observable, map } from 'rxjs';
import { Store } from '@ngrx/store';
import { UsersService } from '../../core/services/users.service';

interface AppState {
    exams: ExamsState;
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        ActivityLogComponent,
        CalendarComponent,
        SidebarComponent,
        UpcomingExamComponent,
    ],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    } | null = null;
    exams$: Observable<Exam[]>;
    hasPendingUsers$!: Observable<boolean>;

    constructor(
        private authService: AuthService,
        private usersService: UsersService,
        private router: Router,
        private store: Store<AppState>,
    ) {
        this.exams$ = this.store.select(selectAllExamsSorted);
    }

    ngOnInit() {
        const u = this.authService.getUser();
        if (!u) {
            this.router.navigate(['/login']);
            return;
        }
        this.user = u;

        this.store.dispatch(ExamActions.loadExams());
        this.hasPendingUsers$ = this.usersService.getAll().pipe(
            map((users) => users.some((u) => u.status === 'pending'))
        );
    }
}
