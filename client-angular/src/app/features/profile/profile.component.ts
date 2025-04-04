import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styles: [`
    .profile-container {
      padding: 20px;
    }
    .profile-header {
      margin-bottom: 20px;
    }
    .profile-section {
      margin-bottom: 15px;
    }
  `],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ProfileComponent implements OnInit {
  user: any;
  error: string | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userService.getUserProfile(currentUser._id).subscribe({
        next: data => this.user = data,
        error: err => this.error = 'Failed to load profile'
      });
    } else {
      this.error = 'User not authenticated';
    }
  }

  navigateToEdit(): void {
    this.router.navigate(['/profile/edit']);
  }
}
