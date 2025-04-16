// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for emerald.module settings
//
// COMMON CUSTOMIZATIONS:
// - NOTIFICATION_DURATION: Duration for notifications in milliseconds (default: 3000)
//   Related to: client-angular/src/app/core/services/notification.service.ts
// ===================================================
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Import all Emerald components
import { AppCardComponent } from './components/app-card/app-card.component';
import { AvatarComponent } from './components/avatar/avatar.component';
import { CarouselComponent } from './components/carousel/carousel.component';
import { InfoPanelComponent } from './components/info-panel/info-panel.component';
import { LabelComponent } from './components/label/label.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { SkeletonLoaderComponent } from './components/skeleton-loader/skeleton-loader.component';
import { ToggleComponent } from './components/toggle/toggle.component';

// Import new components we'll create
import { CardGridComponent } from './components/card-grid/card-grid.component';
import { PagerComponent } from './components/pager/pager.component';
import { FloatingActionButtonComponent } from './components/floating-action-button/floating-action-button.component';

/**
 * Emerald.js Integration Module
 *
 * This module provides Angular wrappers for Emerald.js UI components.
 * Emerald.js is a UI component library that provides a set of reusable UI components.
 *
 * Documentation: https://docs-emerald.condorlabs.io/
 *
 * Components included:
 * - AppCard: Card component for displaying ads in various layouts
 * - Label: Label component for displaying status and categories
 * - Avatar: Avatar component for user profiles with online status
 * - Carousel: Carousel component for image galleries
 * - InfoPanel: Panel component for structured information display
 * - PageHeader: Header component with breadcrumbs and actions
 * - SkeletonLoader: Loading skeleton for content placeholders
 * - Toggle: Toggle switch for boolean settings
 * - CardGrid: Grid layout for displaying multiple cards
 * - Pager: Pagination component for navigating through results
 * - FloatingActionButton: Floating action button for primary actions
 */
@NgModule({
  declarations: [
    // No declarations needed for standalone components
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // Import standalone components
    AppCardComponent,
    AvatarComponent,
    CarouselComponent,
    InfoPanelComponent,
    LabelComponent,
    PageHeaderComponent,
    PagerComponent,
    SkeletonLoaderComponent,
    ToggleComponent,
  ],
  exports: [
    // Export all components for use in other modules
    AppCardComponent,
    AvatarComponent,
    CarouselComponent,
    InfoPanelComponent,
    LabelComponent,
    PageHeaderComponent,
    SkeletonLoaderComponent,
    ToggleComponent,
    CardGridComponent,
    PagerComponent,
    FloatingActionButtonComponent,
  ],
})
export class EmeraldModule {}
