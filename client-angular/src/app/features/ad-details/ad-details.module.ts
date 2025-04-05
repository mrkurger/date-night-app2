import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AdDetailsComponent } from './ad-details.component';

const routes: Routes = [
  { path: '', component: AdDetailsComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    AdDetailsComponent
  ]
})
export class AdDetailsModule { }
