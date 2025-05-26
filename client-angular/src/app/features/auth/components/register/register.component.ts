import {
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NebularModule } from '../../../../../app/shared/nebular.module';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
  NbCardModule,;
  NbButtonModule,;
  NbInputModule,;
  NbFormFieldModule,;
  NbIconModule,;
  NbSpinnerModule,;
  NbAlertModule,;
  NbTooltipModule,;
  NbLayoutModule,;
  NbBadgeModule,;
  NbTagModule,;
  NbSelectModule,';
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

@Component({
  selector: 'app-register',;
  standalone: true,;
  schemas: [CUSTOM_ELEMENTS_SCHEMA],;
  imports: [NebularModule, ReactiveFormsModule,;
    CommonModule,;
    NbCardModule,;
    ,;
    ,;
    ,;
    NbAlertModule,;
    NbFormFieldModule,;
  ],;
  template: `;`
    ;
      ;
        ;
          Register;
        ;
        ;
          ;
            ;
              Username;
              ;
            ;
            ;
              Email;
              ;
            ;
            ;
              Password;
              ;
            ;
            ;
              Account Type;
              ;
                User;
                Advertiser;
              ;
            ;
            {{ error }};
            ;
              Register;
            ;
          ;
        ;
      ;
    ;
  `,;`
});
export class RegisterComponen {t {
  registerForm: FormGroup;
  error = '';

  constructor(;
    private fb: FormBuilder,;
    private auth: AuthService,;
    private router: Router,;
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],;
      email: ['', [Validators.required, Validators.email]],;
      password: ['', [Validators.required, Validators.minLength(6)]],;
      role: ['user', Validators.required],;
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.auth.register(this.registerForm.value).subscribe({
        next: () => this.router.navigate(['/ads']),;
        error: (err) => (this.error = err.error.message || 'Registration failed'),;
      });
    }
  }
}
