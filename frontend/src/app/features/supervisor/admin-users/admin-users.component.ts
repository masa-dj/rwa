import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../core/services/users.service';
import { AppUser } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-users.component.html',
})
export class AdminUsersComponent implements OnInit {
  users: AppUser[] = [];

  constructor(private usersService: UsersService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.usersService.getAll().subscribe((users) => (this.users = users));
  }

  approve(id: string) {
    this.usersService.updateStatus(id, 'approved').subscribe(() => this.load());
  }

  reject(id: string) {
    this.usersService.updateStatus(id, 'rejected').subscribe(() => this.load());
  }
}
