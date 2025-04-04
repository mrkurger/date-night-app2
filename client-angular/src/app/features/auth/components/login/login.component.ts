import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h3 class="card-title text-center">Login</h3>
              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" formControlName="email" class="form-control">
                </div>
                <div class="form-group">
                  <label>Password</label>
                  <input type="password" formControlName="password" class="form-control">
                </div>
                <div *ngIf="error" class="alert alert-danger">{{error}}</div>
                <button type="submit" class="btn btn-primary w-100" [disabled]="loginForm.invalid">
                  Login
                </button>
              </form>
              <div class="text-center mt-3">
                <a routerLink="/auth/register">Need an account? Register</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.auth.login(this.loginForm.value).subscribe({
        next: () => this.router.navigate(['/ads']),
        error: err => this.error = err.error.message || 'Login failed'
      });
    }
  }
}
