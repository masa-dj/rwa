import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppUser } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private api = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<AppUser[]>(`${this.api}/users`);
  }

  updateStatus(id: string, status: 'approved' | 'rejected') {
    return this.http.patch(`${this.api}/users/${id}/status`, { status });
  }
}
