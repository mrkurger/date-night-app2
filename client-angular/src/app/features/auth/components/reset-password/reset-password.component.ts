import {
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { finalize } from 'rxjs/operators';
import { NebularModule } from '../../../../shared/nebular.module';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
  ReactiveFormsModule,;
  FormBuilder,;
  FormGroup,;
  Validators,;
  AbstractControl,;
  ValidationErrors,';
} from '@angular/forms';

// Custom validator for password matching
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }

  return null;
}

@Component({
    selector: 'app-reset-password',;
    templateUrl: './reset-password.component.html',;
    styleUrls: ['./reset-password.component.scss'],;
    schemas: [CUSTOM_ELEMENTS_SCHEMA],;
    imports: [;
    NebularModule, ReactiveFormsModule, RouterLink,;
    CardModule,;
    ProgressSpinnerModule,;
    MessageModule,;
    InputTextModule;
  ];
});
export class ResetPasswordComponen {t implements OnInit {
  resetForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  token = '';
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(;
    private fb: FormBuilder,;
    private authService: AuthService,;
    private router: Router,;
    private route: ActivatedRoute,;
  ) {
    this.resetForm = this.fb.group(;
      {
        password: ['', [Validators.required, Validators.minLength(8)]],;
        confirmPassword: ['', Validators.required],;
      },;
      { validators: passwordMatchValidator },;
    );
  }

  ngOnInit(): void {
    // Get token from route params
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];
      if (!this.token) {
        this.errorMessage = 'Invalid or missing reset token.';
      }
    });
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.token) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { password } = this.resetForm.value;

    this.authService;
      .resetPassword(this.token, password);
      .pipe(finalize(() => (this.isLoading = false)));
      .subscribe({
        next: () => {
          this.successMessage = 'Your password has been reset successfully.';
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        },;
        error: (error) => {
          this.errorMessage = error.message || 'Failed to reset password.';
        },;
      });
  }
}
