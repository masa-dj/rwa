import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonComponent } from '../button/button.component';
import { AuthService } from '../../../core/services/auth.service';

import {
    LucideLayoutDashboard,
    LucideClipboardList,
    LucideUserCog,
    LucideLogOut,
    LucideLibrary,
    LucideNotebookPen,
    LucideChartLine,
    LucideCircleAlert,
    LucideMenu,
    LucideX,
} from '@lucide/angular';
import { Observable, filter, map } from 'rxjs';
import { UsersService } from '../../../core/services/users.service';

interface NavItem {
    label: string;
    route: string;
    icon: any;
}

const SUPERVISOR_NAV: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: LucideLayoutDashboard },
    { label: 'Exams', route: '/exams', icon: LucideClipboardList },
    { label: 'Reports', route: '/reports', icon: LucideLibrary },
    { label: 'Analysis', route: '/analysis', icon: LucideChartLine },
];

const STUDENT_NAV: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: LucideLayoutDashboard },
    { label: 'Practice', route: '/practice', icon: LucideNotebookPen },
    { label: 'Exams', route: '/exams', icon: LucideClipboardList },
    { label: 'Reports', route: '/reports', icon: LucideLibrary },
    { label: 'Analysis', route: '/analysis', icon: LucideChartLine },
];

const USERS_NAV_ITEM: NavItem = {
    label: 'Users',
    route: '/admin/users',
    icon: LucideUserCog,
};

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, ButtonComponent],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
    readonly LogOutIcon = LucideLogOut;
    readonly Alert = LucideCircleAlert;
    readonly MenuIcon = LucideMenu;
    readonly CloseIcon = LucideX;
    hasPendingUsers$!: Observable<boolean>;
    isOpen = false;
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
        private router: Router
    ) {}

    ngOnInit() {
        if (this.isSupervisor) {
            this.hasPendingUsers$ = this.usersService
                .getAll()
                .pipe(
                    map((users) => users.some((u) => u.status === 'pending'))
                );
        }

        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(() => {
                this.isOpen = false;
            });
    }

    toggleSidebar() {
        this.isOpen = !this.isOpen;
    }

    get isSupervisor(): boolean {
        return this.authService.getUser()?.role === 'supervisor';
    }

    get navItems(): NavItem[] {
        const role = this.authService.getUser()?.role;
        return role === 'supervisor' ? SUPERVISOR_NAV : STUDENT_NAV;
    }

    get usersNavItem(): NavItem {
        return USERS_NAV_ITEM;
    }

    get userName(): string {
        const u = this.authService.getUser();
        return u ? `${u.firstName} ${u.lastName}` : '';
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
