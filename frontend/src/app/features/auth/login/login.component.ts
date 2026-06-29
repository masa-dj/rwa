import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.error = '';
    this.loading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.error = 'Invalid email or password';
        this.loading = false;
      },
    });
  }
}