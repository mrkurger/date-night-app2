import { OnInit } from '@angular/core';
import { NebularModule } from '../../../../app/shared/nebular.module';
import {
  NbCardModule,
  NbButtonModule,
  NbInputModule,
  NbFormFieldModule,
  NbIconModule,
  NbSpinnerModule,
  NbAlertModule,
  NbTooltipModule,
} from '@nebular/theme';

import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (login.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { NbAuthService, NbAuthResult } from '@nebular/auth';

// Nebular Modules

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', './social-login.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [NebularModule, CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NbCardModule,
    NbFormFieldModule,
    NbInputModule,
    NbButtonModule,
    NbIconModule,
    NbSpinnerModule,
    NbAlertModule,
    NbTooltipModule,
  ],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  returnUrl = '/dashboard';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private nbAuthService: NbAuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // Get return url from route parameters or default to '/dashboard'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Redirect if already logged in
    if (this.userService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.userService
      .login({ email, password })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Login failed. Please check your credentials.';
        },
      });
  }

  socialLogin(provider: string): void {
    this.isLoading = true;

    this.nbAuthService.authenticate(provider).subscribe((result: NbAuthResult) => {
      this.isLoading = false;
      if (result.isSuccess()) {
        // Only allow redirects to internal routes for security
        const redirect = result.getRedirect();
        if (
          redirect &&
          redirect.startsWith('/') &&
          !redirect.startsWith('//') &&
          !redirect.includes(':')
        ) {
          this.router.navigateByUrl(redirect);
        } else {
          this.router.navigateByUrl(this.returnUrl);
        }
      } else {
        this.errorMessage =
          result.getErrors()[0] || `Login with ${provider} failed. Please try again.`;
      }
    });
  }
}
