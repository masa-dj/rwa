import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../core/services/users.service';
import { AppUser } from '../../../core/services/auth.service';
import { SidebarComponent } from '../../../shared/ui/sidebar/sidebar.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [CommonModule, SidebarComponent, ButtonComponent],
    templateUrl: './admin-users.component.html',
    styleUrls: ['./admin-users.component.scss'],
})
export class AdminUsersComponent implements OnInit {
    users: AppUser[] = [];
    openMenuId: string | null = null;
    menuPosition = { top: 0, left: 0 };

    constructor(private usersService: UsersService,  private elementRef: ElementRef) {}

    ngOnInit() {
        this.load();
    }

    load() {
        this.usersService.getAll().subscribe((users) => (this.users = users));
        this.openMenuId = null;
    }

    //aproval
    approve(id: string) {
        this.usersService
            .updateStatus(id, 'approved')
            .subscribe(() => this.load());
    }

    reject(id: string) {
        this.usersService
            .updateStatus(id, 'rejected')
            .subscribe(() => this.load());
    }

    //menu for additional actions
    toggleMenu(id: string, event: MouseEvent) {
        event.stopPropagation();
        if (this.openMenuId === id) {
            this.openMenuId = null;
            return;
        }
        const button = event.currentTarget as HTMLElement;
        const rect = button.getBoundingClientRect();
        this.menuPosition = { top: rect.bottom + 4, left: rect.right - 120 };
        this.openMenuId = id;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        if (!this.openMenuId) return;

        const target = event.target as HTMLElement;
        const clickedInsideDropdown = target.closest('.menu__dropdown');
        const clickedInsideTrigger = target.closest('.menu__trigger');

        if (!clickedInsideDropdown && !clickedInsideTrigger) {
        this.openMenuId = null;
        }
    }

    update(id: string) {
        console.log('update user', id);
        this.openMenuId = null;
    }

    remove(id: string) {
        if (!confirm('Delete this user? This cannot be undone.')) return;
        this.usersService.delete(id).subscribe(() => this.load());
    }

}
