import { Component, OnInit } from '@angular/core';
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

  constructor(private usersService: UsersService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.usersService.getAll().subscribe((users) => (this.users = users));
    this.openMenuId = null;
  }

  approve(id: string) {
    this.usersService.updateStatus(id, 'approved').subscribe(() => this.load());
  }

  reject(id: string) {
    this.usersService.updateStatus(id, 'rejected').subscribe(() => this.load());
  }

  toggleMenu(id: string) {
    this.openMenuId = this.openMenuId === id ? null : id;
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
