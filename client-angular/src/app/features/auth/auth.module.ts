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
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),

    // Nebular Theme
    NbLayoutModule,
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
          clientId: 'YOUR_GOOGLE_CLIENT_ID',
          clientSecret: '',
          authorize: {
            endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
            responseType: NbOAuth2ResponseType.CODE,
            scope: 'profile email',
            redirectUri: `${window.location.origin}/auth/callback`,
          },
          token: {
            endpoint: `${environment.apiUrl}/auth/google/callback`,
            grantType: NbOAuth2GrantType.AUTHORIZATION_CODE,
            class: NbAuthOAuth2JWTToken,
            redirectUri: `${window.location.origin}/auth/callback`,
          },
        }),
        NbOAuth2AuthStrategy.setup({
          name: 'facebook',
          clientId: 'YOUR_FACEBOOK_CLIENT_ID',
          clientSecret: '',
          authorize: {
            endpoint: 'https://www.facebook.com/v10.0/dialog/oauth',
            responseType: NbOAuth2ResponseType.CODE,
            scope: 'email',
            redirectUri: `${window.location.origin}/auth/callback`,
          },
          token: {
            endpoint: `${environment.apiUrl}/auth/facebook/callback`,
            grantType: NbOAuth2GrantType.AUTHORIZATION_CODE,
            class: NbAuthOAuth2JWTToken,
            redirectUri: `${window.location.origin}/auth/callback`,
          },
        }),
        NbOAuth2AuthStrategy.setup({
          name: 'apple',
          clientId: 'YOUR_APPLE_CLIENT_ID',
          clientSecret: '',
          authorize: {
            endpoint: 'https://appleid.apple.com/auth/authorize',
            responseType: NbOAuth2ResponseType.CODE,
            scope: 'name email',
            redirectUri: `${window.location.origin}/auth/callback`,
          },
          token: {
            endpoint: `${environment.apiUrl}/auth/apple/callback`,
            grantType: NbOAuth2GrantType.AUTHORIZATION_CODE,
            class: NbAuthOAuth2JWTToken,
            redirectUri: `${window.location.origin}/auth/callback`,
          },
        }),
        NbOAuth2AuthStrategy.setup({
          name: 'microsoft',
          clientId: 'YOUR_MICROSOFT_CLIENT_ID',
          clientSecret: '',
          clientAuthMethod: NbOAuth2ClientAuthMethod.REQUEST_BODY,
          authorize: {
            endpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
            responseType: NbOAuth2ResponseType.CODE,
            scope: 'openid profile email',
            redirectUri: `${window.location.origin}/auth/callback`,
          },
          token: {
            endpoint: `${environment.apiUrl}/auth/microsoft/callback`,
            grantType: NbOAuth2GrantType.AUTHORIZATION_CODE,
            class: NbAuthOAuth2JWTToken,
            redirectUri: `${window.location.origin}/auth/callback`,
          },
        }),
      ],
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
