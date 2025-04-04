import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/material.module';
import { AdBrowserComponent } from './ad-browser.component';

const routes: Routes = [
  { path: '', component: AdBrowserComponent }
];

@NgModule({
  declarations: [
    AdBrowserComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class AdBrowserModule { }
