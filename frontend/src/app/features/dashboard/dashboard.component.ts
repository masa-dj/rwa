import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ActivityLogComponent } from '../supervisor/activity-log/activity-log.component';



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ActivityLogComponent, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  user: { id: string; email: string; firstName: string; lastName: string; role: string } | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    const u = this.authService.getUser();
    if (!u) this.router.navigate(['/login']);
    else this.user = u;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
