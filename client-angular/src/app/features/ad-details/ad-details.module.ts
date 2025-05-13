// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for ad-details.module settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AdDetailsComponent } from './ad-details.component';

const routes: Routes = [{ path: '', component: AdDetailsComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), AdDetailsComponent],
})
export class AdDetailsModule {}
