import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { AdBrowserComponent } from './ad-browser.component';

const routes: Routes = [
  { path: '', component: AdBrowserComponent }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule.forChild(routes),
    AdBrowserComponent
  ]
})
export class AdBrowserModule { }
