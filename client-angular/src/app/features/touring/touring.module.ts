import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TouringComponent } from './touring.component';

const routes: Routes = [
  {
    path: '',
    component: TouringComponent
  }
];

@NgModule({
  declarations: [
    TouringComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class TouringModule { }