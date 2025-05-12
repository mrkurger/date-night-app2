// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (edit-profile.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [UserService, AuthService, NotificationService],
  template: `
    <div class="container mt-4">
      <div class="row">
        <div class="col-md-8 offset-md-2">
          <div class="card">
            <div class="card-header">
              <h2>Edit Profile</h2>
            </div>
            <div class="card-body">
              <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
                <div class="form-group mb-3">
                  <label for="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    formControlName="username"
                    class="form-control"
                    [ngClass]="{ 'is-invalid': submitted && f.username.errors }"
                  />
                  <div *ngIf="submitted && f.username.errors" class="invalid-feedback">
                    <div *ngIf="f.username.errors.required">Username is required</div>
                  </div>
                </div>

                <div class="form-group mb-3">
                  <label for="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    formControlName="email"
                    class="form-control"
                    [ngClass]="{ 'is-invalid': submitted && f.email.errors }"
                  />
                  <div *ngIf="submitted && f.email.errors" class="invalid-feedback">
                    <div *ngIf="f.email.errors.required">Email is required</div>
                    <div *ngIf="f.email.errors.email">Email must be a valid email address</div>
                  </div>
                </div>

                <div class="form-group mb-3">
                  <label for="bio">Bio</label>
                  <textarea id="bio" formControlName="bio" class="form-control" rows="4"></textarea>
                </div>

                <div class="form-group mb-3">
                  <label for="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    formControlName="location"
                    class="form-control"
                  />
                </div>

                <div class="form-group mb-3">
                  <label for="website">Website</label>
                  <input
                    type="url"
                    id="website"
                    formControlName="website"
                    class="form-control"
                    [ngClass]="{ 'is-invalid': submitted && f.website.errors }"
                  />
                  <div *ngIf="submitted && f.website.errors" class="invalid-feedback">
                    <div *ngIf="f.website.errors.pattern">Please enter a valid URL</div>
                  </div>
                </div>

                <div class="form-group mb-3">
                  <label for="phone">Phone</label>
                  <input type="tel" id="phone" formControlName="phone" class="form-control" />
                </div>

                <div class="form-group d-flex justify-content-between">
                  <button type="button" class="btn btn-secondary" (click)="cancel()">Cancel</button>
                  <button type="submit" class="btn btn-primary" [disabled]="loading">
                    <span *ngIf="loading" class="spinner-border spinner-border-sm mr-1"></span>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      .card-header {
        background-color: #f8f9fa;
      }
    `,
  ],
})
export class EditProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.profileForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      bio: [''],
      location: [''],
      website: ['', Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')],
      phone: [''],
    });

    this.loadUserData();
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.profileForm.controls;
  }

  loadUserData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userService.getUserProfile(currentUser._id).subscribe({
        next: (user) => {
          this.profileForm.patchValue({
            username: user.username,
            email: user.email,
            bio: user.bio || '',
            location: user.location || '',
            website: user.website || '',
            phone: user.phone || '',
          });
        },
        error: (error) => {
          this.notificationService.error('Failed to load user data');
          console.error('Error loading user data:', error);
        },
      });
    }
  }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;
    const currentUser = this.authService.getCurrentUser();

    if (currentUser) {
      this.userService.updateUserProfile(currentUser._id, this.profileForm.value).subscribe({
        next: () => {
          this.loading = false;
          this.notificationService.success('Profile updated successfully');
          this.router.navigate(['/profile']);
        },
        error: (error) => {
          this.loading = false;
          this.notificationService.error('Failed to update profile');
          console.error('Error updating profile:', error);
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/profile']);
  }
}
