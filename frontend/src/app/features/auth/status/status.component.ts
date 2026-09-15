import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { AppUser } from '../../../core/models/app.models';
import { Router } from '@angular/router';

@Component({
    selector: 'app-status',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './status.component.html',
})
export class StatusComponent implements OnInit {
    user: AppUser | null = null;

    constructor(private authService: AuthService, private router: Router) {}

    ngOnInit() {
        this.user = this.authService.getUser();
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
