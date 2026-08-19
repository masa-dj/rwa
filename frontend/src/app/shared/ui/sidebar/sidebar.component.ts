import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonComponent } from '../button/button.component';
import { AuthService } from '../../../core/services/auth.service';

import {
  LucideLayoutDashboard,
  LucideUsers,
  LucideClipboardList,
  LucideNewspaper,
  LucideUserCog,
  LucideLogOut,
  LucideLibrary,
  LucideNotebookPen,
} from '@lucide/angular';


interface NavItem {
  label: string;
  route: string;
  icon: any;
}

const SUPERVISOR_NAV: NavItem[] = [
  { label: 'Dashboard', route: '/dashboard',icon: LucideLayoutDashboard },
  { label: 'Students', route: '/dashboard', icon: LucideUsers }, // /students
  { label: 'Exams', route: '/dashboard', icon: LucideClipboardList}, // /exams
  { label: 'Reports', route: '/dashboard', icon: LucideLibrary }, // /reports
  { label: 'News', route: '/news', icon: LucideNewspaper },
];

const STUDENT_NAV: NavItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: LucideLayoutDashboard  },
  { label: 'Practice', route: '/dashboard', icon: LucideNotebookPen }, // /practice
  { label: 'Exams', route: '/dashboard', icon: LucideClipboardList }, // /exams
  { label: 'Reports', route: '/dashboard', icon: LucideLibrary },  // /reports
  { label: 'News', route: '/news', icon: LucideNewspaper },
];

const USERS_NAV_ITEM: NavItem = { label: 'Users', route: '/admin/users', icon: LucideUserCog  };

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ButtonComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  readonly LogOutIcon = LucideLogOut;
  constructor(private authService: AuthService, private router: Router) {}

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
