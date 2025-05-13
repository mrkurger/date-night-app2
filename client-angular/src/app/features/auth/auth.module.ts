// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for auth.module settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import {
  NbCardModule,
  NbInputModule,
  NbButtonModule,
  NbIconModule,
  NbCheckboxModule,
  NbSpinnerModule,
  NbFormFieldModule,
  NbRadioModule,
  NbLayoutModule,
  NbAlertModule,
  NbTooltipModule,
} from '@nebular/theme';

import {
  NbAuthModule,
  NbAuthOAuth2JWTToken,
  NbOAuth2AuthStrategy,
  NbOAuth2ClientAuthMethod,
  NbOAuth2GrantType,
  NbOAuth2ResponseType,
  NbPasswordAuthStrategy,
} from '@nebular/auth';

// Components
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RequestPasswordComponent } from './components/request-password/request-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';
import { environment } from '../../../environments/environment';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'request-password', component: RequestPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
];

const socialLinks = [
  {
    url: '/auth/google',
    icon: 'google',
    title: 'Google',
  },
  {
    url: '/auth/facebook',
    icon: 'facebook',
    title: 'Facebook',
  },
  {
    url: '/auth/apple',
    icon: 'apple',
    title: 'Apple',
  },
  {
    url: '/auth/microsoft',
    icon: 'microsoft',
    title: 'Microsoft',
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NbCardModule,
    NbInputModule,
    NbButtonModule,
    NbIconModule,
    NbCheckboxModule,
    NbSpinnerModule,
    NbFormFieldModule,
    NbRadioModule,
    NbAlertModule,
    NbTooltipModule,
    // Nebular Auth
    NbAuthModule.forRoot({
      strategies: [
        NbOAuth2AuthStrategy.setup({
          name: 'google',
    authorize: {
            endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    redirectUri: `${window.location.origin}/auth/callback`,
    token: {
            endpoint: `${environment.apiUrl}/auth/google/callback`,
    redirectUri: `${window.location.origin}/auth/callback`,
    NbOAuth2AuthStrategy.setup({
          name: 'facebook',
    authorize: {
            endpoint: 'https://www.facebook.com/v10.0/dialog/oauth',
    redirectUri: `${window.location.origin}/auth/callback`,
    token: {
            endpoint: `${environment.apiUrl}/auth/facebook/callback`,
    redirectUri: `${window.location.origin}/auth/callback`,
    NbOAuth2AuthStrategy.setup({
          name: 'apple',
    authorize: {
            endpoint: 'https://appleid.apple.com/auth/authorize',
    redirectUri: `${window.location.origin}/auth/callback`,
    token: {
            endpoint: `${environment.apiUrl}/auth/apple/callback`,
    redirectUri: `${window.location.origin}/auth/callback`,
    NbOAuth2AuthStrategy.setup({
          name: 'microsoft',
    authorize: {
            endpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    redirectUri: `${window.location.origin}/auth/callback`,
    token: {
            endpoint: `${environment.apiUrl}/auth/microsoft/callback`,
    redirectUri: `${window.location.origin}/auth/callback`
    LoginComponent,
    RegisterComponent,
    RequestPasswordComponent,
    ResetPasswordComponent,
    AuthLayoutComponent,],
    }),

    // Components
    LoginComponent,
    RegisterComponent,
    AuthLayoutComponent,
    RequestPasswordComponent,
    ResetPasswordComponent,
  ],
  // No exports needed for standalone components
})
export class AuthModule {}
