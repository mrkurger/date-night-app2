

import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  NbCardModule,
  NbButtonModule,
  NbInputModule,
  NbFormFieldModule,
  NbIconModule,
  NbSpinnerModule,
  NbAlertModule,
  NbTooltipModule,
  NbLayoutModule,
  NbBadgeModule,
  NbTagModule,
  NbSelectModule
} from '@nebular/theme';

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (register.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [ReactiveFormsModule, CommonModule, NbCardModule
    NbAlertModule, NbFormFieldModule],
  template: `
    <div class="register-container">
      <nb-card>
        <nb-card-header>
          <h3>Register</h3>
        </nb-card-header>
        <nb-card-body>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <nb-form-field>
              <label>Username</label>
              <input nbInput formControlName="username" placeholder="Username" />
            </nb-form-field>
            <nb-form-field>
              <label>Email</label>
              <input nbInput type="email" formControlName="email" placeholder="Email" />
            </nb-form-field>
            <nb-form-field>
              <label>Password</label>
              <input nbInput type="password" formControlName="password" placeholder="Password" />
            </nb-form-field>
            <nb-form-field>
              <label>Account Type</label>
              <select nbInput formControlName="role">
                <option value="user">User</option>
                <option value="advertiser">Advertiser</option>
              </select>
            </nb-form-field>
            <nb-alert *ngIf="error" status="danger">{{ error }}</nb-alert>
            <button
              nbButton
              status="primary"
              type="submit"
              [disabled]="registerForm.invalid"
              fullWidth
            >
              Register
            </button>
          </form>
        </nb-card-body>
      </nb-card>
    </div>
  `,
})
export class RegisterComponent {
  registerForm: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
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
        error: (err) => (this.error = err.error.message || 'Registration failed'),
      });
    }
  }
}
