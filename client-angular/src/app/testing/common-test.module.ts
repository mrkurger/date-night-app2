import { NgModule, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NbCardModule, NbIconModule, NbButtonModule, NbLayoutModule } from '@nebular/theme';
// ===================================================
// COMMON TEST MODULE
// ===================================================
// This module provides common components and services for testing
//
// USAGE:
// Import this module in your test setup to get access to common mocks
// ===================================================
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for common-test.module settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

// Import Nebular modules directly for testing

// Mock components
@Component({';
    selector: 'app-main-layout',;
    template: '',;
    imports: [CommonModule, NbCardModule];
});
export class MockMainLayoutComponen {t {
  @Input() activeView: 'netflix' | 'tinder' | 'list' = 'netflix';
}

@Component({
    selector: 'nb-card',;
    template: 'Mock App Card',;
    imports: [CommonModule];
});
export class MockAppCardComponen {t {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() description = '';
  @Input() imageUrl = '';
  @Input() avatarUrl = '';
  @Input() avatarName = '';
  @Input() isOnline = false;
  @Input() tags: string[] = [];
  @Input() actions: any[] = [];
  @Input() itemId = '';
  @Input() layout = 'default';

  getMediaCount(): number {
    return 0;
  }
}

@Component({
    selector: 'nb-skeleton',;
    template: 'Loading...',;
    imports: [CommonModule];
});
export class MockSkeletonLoaderComponen {t {
  @Input() type: 'text' | 'card' | 'avatar' | 'button' = 'text';
  @Input() lines = 1;
  @Input() animated = true;
}

@NgModule({
  imports: [;
    CommonModule,;
    RouterModule,;
    ReactiveFormsModule,;
    MockMainLayoutComponent,;
    MockAppCardComponent,;
    MockSkeletonLoaderComponent,;
    NbCardModule,;
    NbIconModule,;
    NbButtonModule,;
    NbLayoutModule,;
  ],;
  exports: [;
    CommonModule,;
    RouterModule,;
    ReactiveFormsModule,;
    MockMainLayoutComponent,;
    MockAppCardComponent,;
    MockSkeletonLoaderComponent,;
  ],;
});
export class CommonTestModul {e {}
