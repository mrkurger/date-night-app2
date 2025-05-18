import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// Using direct imports from @nebular/theme instead of the shared module
import { NebularModule } from '../../../../../app/shared/nebular.module';
import {
  NbLayoutModule,
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbAlertModule,
  NbSpinnerModule,
  NbTooltipModule,
} from '@nebular/theme';

import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [NebularModule, CommonModule,
    RouterOutlet,
    NbLayoutModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbAlertModule,
    NbSpinnerModule,
    NbTooltipModule,
  ],
})
export class AuthLayoutComponent {}
