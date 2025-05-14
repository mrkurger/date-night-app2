import { NbIconModule } from '@nebular/theme';
import { NbFormFieldModule } from '@nebular/theme';
import { NbCardModule } from '@nebular/theme';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-request-password',
  templateUrl: './request-password.component.html',
  styleUrls: ['./request-password.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NbCardModule, NbButtonModule, NbInputModule, NbIconModule, NbSpinnerModule, NbFormFieldModule, NbAlertModule, NbTooltipModule],
})
export class RequestPasswordComponent {
  requestForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.requestForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { email } = this.requestForm.value;

    this.authService
      .requestPassword(email)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Password reset link has been sent to your email.';
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to send password reset link.';
        },
      });
  }
}
