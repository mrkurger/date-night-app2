// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (register.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h3 class="card-title text-center">Register</h3>
              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                <div class="form-group">
                  <label>Username</label>
                  <input type="text" formControlName="username" class="form-control" />
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" formControlName="email" class="form-control" />
                </div>
                <div class="form-group">
                  <label>Password</label>
                  <input type="password" formControlName="password" class="form-control" />
                </div>
                <div class="form-group">
                  <label>Account Type</label>
                  <select formControlName="role" class="form-control">
                    <option value="user">User</option>
                    <option value="advertiser">Advertiser</option>
                  </select>
                </div>
                <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
                <button
                  type="submit"
                  class="btn btn-primary w-100"
                  [disabled]="registerForm.invalid"
                >
                  Register
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  registerForm: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['user', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.auth.register(this.registerForm.value).subscribe({
        next: () => this.router.navigate(['/ads']),
        error: err => (this.error = err.error.message || 'Registration failed'),
      });
    }
  }
}
