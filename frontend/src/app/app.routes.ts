import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { StatusComponent } from './features/auth/status/status.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AdminUsersComponent } from './features/supervisor/admin-users/admin-users.component';
import { authGuard } from './core/guards/auth.guard';
import { approvedGuard } from './core/guards/approved.guard';
import { supervisorGuard } from './core/guards/supervisor.guard';
import { redirectIfLoggedGuard } from './core/guards/redirect-if-logged.guard';
import { ExamsComponent } from './features/exams/exams.component';
import { ScheduleExamComponent } from './features/supervisor/schedule-exam/schedule-exam.component';
import { ExamRoomComponent } from './features/exam-room/exam-room.component';
import { PracticeComponent } from './features/student/practice/practice.component';
import { PracticeRoomComponent } from './features/student/practice-room/practice-room.component';
import { ReportsComponent } from './features/reports/reports.component';
import { ReportDetailComponent } from './features/report-detail/report-detail.component';
import { AnalysisComponent } from './features/analysis/analysis.component';




export const routes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [redirectIfLoggedGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [redirectIfLoggedGuard] },
    { path: 'status', component: StatusComponent, canActivate: [authGuard] },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard, approvedGuard] },
    { path: 'admin/users', component: AdminUsersComponent, canActivate: [authGuard, approvedGuard, supervisorGuard] },
    { path: 'exams', component: ExamsComponent, canActivate: [authGuard, approvedGuard] },
    { path: 'exams/schedule', component: ScheduleExamComponent, canActivate: [authGuard, approvedGuard, supervisorGuard] },
    { path: 'exams/:id/room', component: ExamRoomComponent, canActivate: [authGuard, approvedGuard] },
    { path: 'practice', component: PracticeComponent, canActivate: [authGuard, approvedGuard] },
    { path: 'practice/:id', component: PracticeRoomComponent, canActivate: [authGuard, approvedGuard] },
    { path: 'reports', component: ReportsComponent, canActivate: [authGuard, approvedGuard] },
    { path: 'reports/:id', component: ReportDetailComponent, canActivate: [authGuard, approvedGuard] },
    { path: 'analysis', component: AnalysisComponent, canActivate: [authGuard, approvedGuard] },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
];
