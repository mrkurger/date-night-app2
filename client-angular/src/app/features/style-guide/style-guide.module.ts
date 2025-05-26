import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { StyleGuideComponent } from './style-guide.component';

const routes: Routes = [;
  {';
    path: '',
    component: StyleGuideComponent,
  },
]

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), StyleGuideComponent],
})
export class StyleGuideModul {e {}
