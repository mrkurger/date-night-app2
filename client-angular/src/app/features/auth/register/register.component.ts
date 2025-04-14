
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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  template: `
    <div class="container mt-5">
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Display Name</label>
          <input type="text" class="form-control" formControlName="displayName">
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" class="form-control" formControlName="email">
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" class="form-control" formControlName="password">
        </div>
        <button type="submit" class="btn btn-primary" [disabled]="loading">
          {{loading ? 'Loading...' : 'Register'}}
        </button>
        <div *ngIf="error" class="alert alert-danger mt-3">{{error}}</div>
      </form>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    
    this.loading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: () => this.router.navigate(['/browse']),
      error: err => {
        this.error = err.message || 'Registration failed';
        this.loading = false;
      }
    });
  }
}
