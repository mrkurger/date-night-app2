import { OnInit } from '@angular/core';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { NbAuthService, NbAuthResult } from '@nebular/auth';
import { finalize } from 'rxjs/operators';
import { NebularModule } from '../../../shared/nebular.module';

// Custom validator for password matching
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }

  return null;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss', './social-login.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [NebularModule, ReactiveFormsModule, RouterLink],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private nbAuthService: NbAuthService,
  ) {
    this.registerForm = this.fb.group(
      {
        firstname: ['', Validators.required],
        lastname: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
        termsAccepted: [false, Validators.requiredTrue],
      },
      { validators: passwordMatchValidator },
    );
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.userService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { firstname, lastname, email, password } = this.registerForm.value;

      // Create a username from first name and last name (for example)
      const username = (firstname + lastname).toLowerCase();

      this.authService
        .register({
          username,
          email,
          password,
          confirmPassword: password,
          role: 'user',
          acceptTerms: true,
        })
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: () => {
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            this.errorMessage = error.message || 'Registration failed. Please try again.';
          },
        });
    } else {
      // Mark all fields as touched to trigger validation
      Object.keys(this.registerForm.controls).forEach((key) => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/auth/login']);
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
          this.router.navigateByUrl('/dashboard');
        }
      } else {
        this.errorMessage =
          result.getErrors()[0] || `Registration with ${provider} failed. Please try again.`;
      }
    });
  }
}
