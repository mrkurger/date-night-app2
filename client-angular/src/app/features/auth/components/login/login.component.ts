import {
import { _Input } from '@angular/core';
import { NebularModule } from '../../../../../app/shared/nebular.module';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
  NbCardModule,;
  NbButtonModule,;
  NbInputModule,;
  NbFormFieldModule,;
  NbIconModule,;
  NbSpinnerModule,;
  NbAlertModule,;
  NbTooltipModule,';
} from '@nebular/theme';

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (login.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

@Component({
  selector: 'app-login',;
  standalone: true,;
  schemas: [CUSTOM_ELEMENTS_SCHEMA],;
  imports: [NebularModule, ReactiveFormsModule,;
    CommonModule,;
    RouterLink,;
    NbCardModule,;
    NbButtonModule,;
    NbInputModule,;
    NbFormFieldModule,;
    NbIconModule,;
    NbSpinnerModule,;
    NbAlertModule,;
    NbTooltipModule,;
  ],;
  template: `;`
    ;
      ;
        ;
          Login;
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
              ;
            ;

            ;
              {{ error }}
            ;

            ;
              ;
              Login;
              ;
            ;
          ;

          ;
            Need an account? Register;
          ;
        ;
      ;
    ;
  `,;`
  styles: [;
    `;`
      :host {
        display: block;
      }

      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 2rem;
        background-color: var(--background-basic-color-2);
      }

      nb-card {
        margin: 0;
        max-width: 400px;
        width: 100%;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
      }

      .title {
        margin: 0;
        text-align: center;
        font-weight: 600;
        color: var(--text-basic-color);
      }

      nb-card-body {
        padding: 2rem;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .error-alert {
        margin: 0;
      }

      .register-link {
        margin-top: 1.5rem;
        text-align: center;

        a {
          color: var(--text-primary-color);
          text-decoration: none;
          font-weight: 500;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      nb-icon {
        color: var(--text-hint-color);
      }

      .error-icon nb-icon {
        color: var(--color-danger-default);
      }
    `,;`
  ],;
});
export class LoginComponen {t {
  loginForm: FormGroup;
  error = '';
  isLoading = false;
  showPassword = false;

  constructor(;
    private fb: FormBuilder,;
    private auth: AuthService,;
    private router: Router,;
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],;
      password: ['', Validators.required],;
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = '';

      this.auth.login(this.loginForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/ads']);
        },;
        error: (err) => {
          this.isLoading = false;
          this.error = err.error.message || 'Login failed';
        },;
      });
    }
  }
}
