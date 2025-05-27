import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

/**
 * Nebular Module (Legacy)
 *
 * This module is being phased out in favor of PrimeNG.
 * It provides basic Angular modules for compatibility.
 */
@NgModule({
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  exports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
})
export class NebularModule {
  /**
   *
   */
  static forRoot(): ModuleWithProviders<NebularModule> {
    return {
      ngModule: NebularModule,
      providers: [],
    };
  }
}
