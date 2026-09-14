import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppUser } from '../models/app.models';
import { APP_CONFIG } from '../config/app-config';

@Injectable({ providedIn: 'root' })
export class UsersService {
    private api = APP_CONFIG.apiUrl;

    constructor(private http: HttpClient) {}

    getAll() {
        return this.http.get<AppUser[]>(`${this.api}/users`);
    }

    updateStatus(id: string, status: 'approved' | 'rejected') {
        return this.http.patch(`${this.api}/users/${id}/status`, { status });
    }

    delete(id: string) {
        return this.http.delete<AppUser[]>(`${this.api}/users/${id}`);
    }

    update(
        id: string,
        dto: { firstName?: string; lastName?: string; role?: string }
    ) {
        return this.http.put<AppUser>(`${this.api}/users/${id}`, dto);
    }
}
