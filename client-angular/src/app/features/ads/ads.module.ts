// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for ads.module settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AdListComponent } from './components/ad-list/ad-list.component';
import { AdCreateComponent } from './components/ad-create/ad-create.component';
import { AdDetailComponent } from './components/ad-detail/ad-detail.component';
import { SwipeViewComponent } from './components/swipe-view/swipe-view.component';

const routes: Routes = [
  { path: '', component: AdListComponent },
  { path: 'create', component: AdCreateComponent },
  { path: ':id', component: AdDetailComponent },
  { path: 'swipe', component: SwipeViewComponent },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    AdListComponent,
    AdCreateComponent,
    AdDetailComponent,
    SwipeViewComponent,
  ],
})
export class AdsModule {}
