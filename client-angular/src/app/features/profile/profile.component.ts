import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any;
  error: string | null = null;

  constructor(private userService: UserService, private authService: AuthService) {}

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

  updateProfile(updatedData: any): void {
    this.userService.updateUserProfile(this.user._id, updatedData).subscribe({
      next: data => this.user = data,
      error: err => this.error = 'Failed to update profile'
    });
  }
}
