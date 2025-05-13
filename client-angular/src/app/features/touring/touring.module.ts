// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for touring.module settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TouringComponent } from './touring.component';

const routes: Routes = [
  {
    path: '',
    component: TouringComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes), TouringComponent],
})
export class TouringModule {}
