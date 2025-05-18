import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';
import { NbDialogService, NbToastrService } from '@nebular/theme';

@Component({
  selector: 'app-user-management',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FormsModule],
  template: `
    <nb-card>
      <nb-card-header class="d-flex justify-content-between align-items-center">
        <h5>User Management</h5>
        <div>
          <nb-select [(ngModel)]="filterRole" (selectedChange)="filterUsers()">
            <nb-option value="all">All Roles</nb-option>
            <nb-option value="user">Users</nb-option>
            <nb-option value="admin">Admins</nb-option>
            <nb-option value="moderator">Moderators</nb-option>
          </nb-select>
          <input
            nbInput
            placeholder="Search users..."
            [(ngModel)]="searchTerm"
            (ngModelChange)="filterUsers()"
          />
        </div>
      </nb-card-header>

      <nb-card-body>
        <table class="table" [class.loading]="loading">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Roles</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of filteredUsers">
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>
                <nb-tag
                  *ngFor="let role of user.roles"
                  [text]="role"
                  [status]="getRoleStatus(role)"
                >
                </nb-tag>
              </td>
              <td>
                <nb-tag [text]="user.status" [status]="getStatusBadge(user.status)"> </nb-tag>
              </td>
              <td>{{ user.lastLogin | date: 'short' }}</td>
              <td>
                <nb-actions size="small">
                  <nb-action icon="edit-outline" (click)="editUser(user)"></nb-action>
                  <nb-action icon="trash-outline" (click)="deleteUser(user)"></nb-action>
                  <nb-action
                    icon="lock-outline"
                    (click)="banUser(user)"
                    *ngIf="user.status !== 'banned'"
                  >
                  </nb-action>
                  <nb-action
                    icon="unlock-outline"
                    (click)="unbanUser(user)"
                    *ngIf="user.status === 'banned'"
                  >
                  </nb-action>
                </nb-actions>
              </td>
            </tr>
          </tbody>
        </table>
      </nb-card-body>
    </nb-card>
  `,
  styles: [
    `
      :host {
        display: block;
        max-width: 100%;
        overflow-x: auto;
      }

      nb-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      nb-select {
        margin-right: 1rem;
      }

      table {
        width: 100%;
      }

      nb-tag {
        margin-right: 0.5rem;
      }

      .actions-cell {
        display: flex;
        gap: 0.5rem;
      }
    `,
  ],
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = false;
  filterRole = 'all';
  searchTerm = '';

  constructor(
    private userService: UserService,
    private dialogService: NbDialogService,
    private toastrService: NbToastrService,
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filterUsers();
        this.loading = false;
      },
      error: (error) => {
        this.toastrService.danger('Failed to load users', 'Error');
        this.loading = false;
      },
    });
  }

  filterUsers() {
    this.filteredUsers = this.users.filter((user) => {
      const roleMatch = this.filterRole === 'all' || user.roles.includes(this.filterRole);
      const searchMatch =
        !this.searchTerm ||
        user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      return roleMatch && searchMatch;
    });
  }

  getRoleStatus(role: string): string {
    switch (role) {
      case 'admin':
        return 'success';
      case 'moderator':
        return 'info';
      default:
        return 'basic';
    }
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'active':
        return 'success';
      case 'banned':
        return 'danger';
      case 'suspended':
        return 'warning';
      default:
        return 'basic';
    }
  }

  editUser(user: User) {
    // TODO: Implement edit user dialog
  }

  deleteUser(user: User) {
    // TODO: Implement delete confirmation dialog
  }

  banUser(user: User) {
    this.userService.banUser(user.id).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex((u) => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
          this.filterUsers();
        }
        this.toastrService.success('User banned successfully');
      },
      error: (error) => {
        this.toastrService.danger('Failed to ban user', 'Error');
      },
    });
  }

  unbanUser(user: User) {
    this.userService.unbanUser(user.id).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex((u) => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
          this.filterUsers();
        }
        this.toastrService.success('User unbanned successfully');
      },
      error: (error) => {
        this.toastrService.danger('Failed to unban user', 'Error');
      },
    });
  }
}
