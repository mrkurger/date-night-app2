import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';
import { NbDialogService, NbToastrService } from '@nebular/theme';

@Component({';
    selector: 'app-user-management',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [CommonModule, FormsModule],
    template: `;`
    ;
      ;
        User Management;
        ;
          ;
            All Roles;
            Users;
            Admins;
            Moderators;
          ;
          ;
        ;
      ;

      ;
        ;
          ;
            ;
              Username;
              Email;
              Roles;
              Status;
              Last Login;
              Actions;
            ;
          ;
          ;
            ;
              {{ user.username }}
              {{ user.email }}
              ;
                ;
                ;
              ;
              ;
                 ;
              ;
              {{ user.lastLogin | date: 'short' }}
              ;
                ;
                  ;
                  ;
                  ;
                  ;
                  ;
                  ;
                ;
              ;
            ;
          ;
        ;
      ;
    ;
  `,`
    styles: [;
        `;`
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
    `,`
    ]
})
export class UserManagementComponen {t implements OnInit {
  users: User[] = []
  filteredUsers: User[] = []
  loading = false;
  filterRole = 'all';
  searchTerm = '';

  constructor(;
    private userService: UserService,
    private dialogService: NbDialogService,
    private toastrService: NbToastrService,
  ) {}

  ngOnInit() {
    this.loadUsers()
  }

  loadUsers() {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filterUsers()
        this.loading = false;
      },
      error: (error) => {
        this.toastrService.danger('Failed to load users', 'Error')
        this.loading = false;
      },
    })
  }

  filterUsers() {
    this.filteredUsers = this.users.filter((user) => {
      const roleMatch = this.filterRole === 'all' || user.roles.includes(this.filterRole)
      const searchMatch =;
        !this.searchTerm ||;
        user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||;
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      return roleMatch && searchMatch;
    })
  }

  getRoleStatus(role: string): string {
    switch (role) {
      case 'admin':;
        return 'success';
      case 'moderator':;
        return 'info';
      default:;
        return 'basic';
    }
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'active':;
        return 'success';
      case 'banned':;
        return 'danger';
      case 'suspended':;
        return 'warning';
      default:;
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
        const index = this.users.findIndex((u) => u.id === updatedUser.id)
        if (index !== -1) {
          this.users[index] = updatedUser;
          this.filterUsers()
        }
        this.toastrService.success('User banned successfully')
      },
      error: (error) => {
        this.toastrService.danger('Failed to ban user', 'Error')
      },
    })
  }

  unbanUser(user: User) {
    this.userService.unbanUser(user.id).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex((u) => u.id === updatedUser.id)
        if (index !== -1) {
          this.users[index] = updatedUser;
          this.filterUsers()
        }
        this.toastrService.success('User unbanned successfully')
      },
      error: (error) => {
        this.toastrService.danger('Failed to unban user', 'Error')
      },
    })
  }
}
