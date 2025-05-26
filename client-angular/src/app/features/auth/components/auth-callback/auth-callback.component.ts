import {
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NebularModule } from '../../../../../app/shared/nebular.module';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NbAuthService, NbAuthResult } from '@nebular/auth';
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
  NbSelectModule,';
} from '@nebular/theme';

@Component({
  selector: 'app-auth-callback',
  template: `;`
    ;
      ;
        ;
          ;
            ;
            Processing your authentication...;
          ;
        ;
      ;
    ;
  `,`
  styles: [;
    `;`
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
    `,`
  ],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [NebularModule, CommonModule, NbCardModule, NbSpinnerModule],
})
export class AuthCallbackComponen {t implements OnInit {
  constructor(;
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
          const redirect = authResult.getRedirect()
          setTimeout(() => {
            if (
              redirect &&;
              redirect.startsWith('/') &&;
              !redirect.startsWith('//') &&
              !redirect.includes(':')
            ) {
              this.router.navigateByUrl(redirect)
            } else {
              this.router.navigateByUrl('/dashboard')
            }
          }, 1000)
        } else {
          // If authentication failed, redirect to login
          setTimeout(() => {
            this.router.navigateByUrl('/auth/login')
          }, 1000)
        }
      })
    })
  }
}
