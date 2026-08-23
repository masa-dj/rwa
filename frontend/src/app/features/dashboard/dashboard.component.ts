import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ActivityLogComponent } from '../supervisor/activity-log/activity-log.component';
import { SidebarComponent } from '../../shared/ui/sidebar/sidebar.component';
import { CalendarComponent } from '../../shared/ui/calendar/calendar.component';
import { ExamService, Exam } from '../../core/services/exam.service';



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ActivityLogComponent, CalendarComponent, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  user: { id: string; email: string; firstName: string; lastName: string; role: string } | null = null;
  exams: Exam[] = [];
  constructor(private authService: AuthService, private router: Router, private examService: ExamService,) {}

  ngOnInit() {
    const u = this.authService.getUser();
    if (!u) {
      this.router.navigate(['/login']);
      return;
    }
    this.user = u;

    const source = u.role === 'supervisor' ? this.examService.getAll() : this.examService.getMine();
    source.subscribe((exams) => (this.exams = exams));
  }
}
