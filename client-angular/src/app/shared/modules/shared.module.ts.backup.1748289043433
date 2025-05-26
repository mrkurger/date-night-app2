import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Import Nebular and PrimeNG shared modules
import { NebularSharedModule } from './nebular-shared.module';
import { PrimeNGModule } from './primeng.module';

// Import custom components
import { NbErrorComponent } from '../components/custom-nebular-components/nb-error/nb-error.component';
import { NbPaginatorComponent } from '../components/custom-nebular-components/nb-paginator/nb-paginator.component';

// Create array of components and modules to import and export
const COMPONENTS = [NbErrorComponent, NbPaginatorComponent];

const MODULES = [
  CommonModule,
  RouterModule,
  FormsModule,
  ReactiveFormsModule,
  HttpClientModule,
  NebularSharedModule,
  PrimeNGModule,
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [...MODULES],
  exports: [...MODULES, ...COMPONENTS],
})
export class SharedModule {}
