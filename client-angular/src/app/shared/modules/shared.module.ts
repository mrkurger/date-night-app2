import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Import the Nebular shared module
import { NebularSharedModule } from './nebular-shared.module';

// Import custom components
import { NbErrorComponent } from '../components/custom-nebular-components/nb-error/nb-error.component';
import { NbSortModule } from '../components/custom-nebular-components/nb-sort/nb-sort.module';
import { NbPaginatorModule } from '../components/custom-nebular-components/nb-paginator/nb-paginator.module';

// Create array of components and modules to import and export
const COMPONENTS = [NbErrorComponent];

const MODULES = [
  CommonModule,
  RouterModule,
  FormsModule,
  ReactiveFormsModule,
  HttpClientModule,
  NebularSharedModule,
  NbSortModule,
  NbPaginatorModule,
];

@NgModule({
  imports: [...MODULES, ...COMPONENTS],
  exports: [...MODULES, ...COMPONENTS],
})
export class SharedModule {}
