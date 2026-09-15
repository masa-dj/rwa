import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HealthCheckService {
    async checkBackend(): Promise<boolean> {
        try {
            const response = await fetch('http://localhost:3000/api');
            return response.ok;
        } catch {
            return false;
        }
    }
}
