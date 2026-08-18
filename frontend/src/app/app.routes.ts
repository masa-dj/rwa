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
import { NewsComponent } from './features/news/news.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [redirectIfLoggedGuard]  },
  { path: 'register', component: RegisterComponent, canActivate: [redirectIfLoggedGuard] },
  { path: 'status', component: StatusComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard, approvedGuard] },
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [authGuard, approvedGuard, supervisorGuard] },
  { path: 'news', component: NewsComponent, canActivate: [authGuard, approvedGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
