import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AdDetailComponent } from '../ads/components/ad-detail/ad-detail.component';

const routes: Routes = [
  { path: '', component: AdDetailComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    AdDetailComponent
  ]
})
export class AdDetailsModule { }
