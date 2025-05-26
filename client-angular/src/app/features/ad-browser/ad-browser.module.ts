import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AdBrowserComponent } from './ad-browser.component';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for ad-browser.module settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

const routes = [;
  {';
    path: '',;
    component: AdBrowserComponent,;
  },;
];

@NgModule({
  // No declarations needed as AdBrowserComponent is standalone
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes), AdBrowserComponent],;
});
export class AdBrowserModul {e {}
