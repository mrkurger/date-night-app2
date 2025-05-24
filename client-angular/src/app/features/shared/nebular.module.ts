// ===================================================
// PRIMENG MODULE CONFIGURATION
// ===================================================
// This file contains all PrimeNG module imports and exports
// for consistent UI components across the application
// ===================================================
import { NgModule, ModuleWithProviders, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

/**
 * Core PrimeNG modules that need to be configured at the root level
 */
const ROOT_PRIMENG_MODULES: Array<ModuleWithProviders<any>> = [];

/**
 * Feature PrimeNG modules that can be imported multiple times
 */
const FEATURE_PRIMENG_MODULES: Array<Type<any>> = [
  ButtonModule,
  CardModule,
  DialogModule,
  DropdownModule,
  InputTextModule,
  TableModule,
  TooltipModule,
  ToastModule,
];

/**
 * NebularModule
 *
 * This module provides all PrimeNG components, directives, and services
 * needed throughout the application. It should be imported in the SharedModule.
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...ROOT_PRIMENG_MODULES,
    ...FEATURE_PRIMENG_MODULES,
  ],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, ...FEATURE_PRIMENG_MODULES],
})
export class NebularModule {}
