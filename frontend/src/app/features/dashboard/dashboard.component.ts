import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ActivityLogComponent } from '../supervisor/activity-log/activity-log.component';
import { SidebarComponent } from '../../shared/ui/sidebar/sidebar.component';
import { CalendarComponent } from '../../shared/ui/calendar/calendar.component';



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ActivityLogComponent, CalendarComponent, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  user: { id: string; email: string; firstName: string; lastName: string; role: string } | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    const u = this.authService.getUser();
    if (!u) this.router.navigate(['/login']);
    else this.user = u;
  }
}
