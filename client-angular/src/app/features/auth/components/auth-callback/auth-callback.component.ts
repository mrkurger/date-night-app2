
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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

import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NbAuthService, NbAuthResult } from '@nebular/auth';

@Component({
  selector: 'app-auth-callback',
  template: `
    <div class="callback-container">
      <nb-card>
        <nb-card-body>
          <div class="text-center">
            <nb-spinner status="primary" size="large"></nb-spinner>
            <p>Processing your authentication...</p>
          </div>
        </nb-card-body>
      </nb-card>
    </div>
  `,
  styles: [
    `
      .callback-container {
        max-width: 500px;
        margin: 100px auto;
        padding: 0 20px;
        text-align: center;
      }

      .text-center {
        text-align: center;
      }

      nb-spinner {
        margin: 20px auto;
      }

      p {
        margin-top: 20px;
        font-size: 1.1rem;
      }
    `,
  ],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    NbCardModule,
    NbSpinnerModule
  ],
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private authService: NbAuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // Get the provider from the route params or query params
    this.route.queryParams.subscribe((params) => {
      // Default to 'google' if no provider is specified
      const provider = params['provider'] || 'google';

      // Process the OAuth callback and redirect to success URL
      this.authService.authenticate(provider).subscribe((authResult: NbAuthResult) => {
        if (authResult.isSuccess()) {
          // Only allow redirects to internal routes for security
          const redirect = authResult.getRedirect();
          setTimeout(() => {
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
          }, 1000);
        } else {
          // If authentication failed, redirect to login
          setTimeout(() => {
            this.router.navigateByUrl('/auth/login');
          }, 1000);
        }
      });
    });
  }
}
