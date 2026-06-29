import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TitleCasePipe],
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