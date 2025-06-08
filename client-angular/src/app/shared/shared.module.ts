import { NgModule } from '@angular/core';
import { PrimeNGModule } from './primeng.module';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Import custom components that don't depend on Nebular
// (These will need to be migrated individually)

/**
 * Shared Module
 *
 * This module exports common Angular modules and PrimeNG modules.
 * Standalone components and pipes should be imported directly where needed.
 *
 * Note: All components and pipes have been migrated to standalone.
 * They should be imported directly in the components that use them.
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrimeNGModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrimeNGModule,
  ],
})
export class SharedModule {}
