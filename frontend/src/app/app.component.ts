import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PresenceService } from './core/services/presence.service';
import { HealthCheckService } from './core/services/health-check.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet],
    template: `<router-outlet />`,
})
export class AppComponent implements OnInit {
    constructor(
        private presenceService: PresenceService,
        private healthCheckService: HealthCheckService,
    ) {}

    async ngOnInit() {
        const isBackendUp = await this.healthCheckService.checkBackend();
        if (!isBackendUp) {
            console.log('Health check failed, backend unavailable.');
        }
        const token = localStorage.getItem('token');
        if (token) {
            this.presenceService.connect(token);
        }
    }
}
