import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { PresenceService } from './presence.service';

export interface AppUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:3000';

  constructor(private http: HttpClient,
    private presenceService: PresenceService,) {}

  login(email: string, password: string) {
    return this.http.post<{ access_token: string; user: any }>(
      `${this.api}/auth/login`,
      { email, password }
    ).pipe(
      tap(res => {
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.presenceService.connect(res.access_token);
      })
    );
  }

  register(dto: { email: string; password: string; firstName: string; lastName: string }) {
    return this.http.post(`${this.api}/auth/register`, dto);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.presenceService.disconnect();
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getUser() {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }

  isLoggedIn() {
    return !!this.getToken();
  }
}
