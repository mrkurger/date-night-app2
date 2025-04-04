import { NgModule } from '@angular/core';
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
  { path: 'swipe', component: SwipeViewComponent }
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
    SwipeViewComponent
  ]
})
export class AdsModule { }
