import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<{ access_token: string; user: any }>(
      `${this.api}/auth/login`,
      { email, password }
    ).pipe(
      tap(res => {
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('user', JSON.stringify(res.user));
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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