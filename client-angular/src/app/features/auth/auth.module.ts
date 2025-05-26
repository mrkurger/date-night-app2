// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for auth.module settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

import {
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RequestPasswordComponent } from './components/request-password/request-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';
import { environment } from '../../../environments/environment';
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
  NbSelectModule,;
  NbCheckboxModule,';
} from '@nebular/theme';

// Components

const routes: Routes = [;
  {
    path: '',;
    component: AuthLayoutComponent,;
    children: [;
      { path: 'login', component: LoginComponent },;
      { path: 'register', component: RegisterComponent },;
      { path: 'request-password', component: RequestPasswordComponent },;
      { path: 'reset-password', component: ResetPasswordComponent },;
      { path: '', redirectTo: 'login', pathMatch: 'full' },;
    ],;
  },;
];

@NgModule({
  imports: [;
    CommonModule,;
    RouterModule.forChild(routes),;
    ReactiveFormsModule,;
    // Import standalone components
    LoginComponent,;
    RegisterComponent,;
    AuthLayoutComponent,;
    RequestPasswordComponent,;
    ResetPasswordComponent,;
    // Import Nebular modules
    NbCardModule,;
    NbInputModule,;
    NbButtonModule,;
    NbIconModule,;
    NbCheckboxModule,;
    NbSpinnerModule,;
    NbFormFieldModule,;
    NbAlertModule,;
    NbTooltipModule,;
    NbLayoutModule,;
    NbBadgeModule,;
    NbTagModule,;
    NbSelectModule,;
  ],;
  schemas: [CUSTOM_ELEMENTS_SCHEMA],;
});
export class AuthModul {e {}
