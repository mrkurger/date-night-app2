import { Component } from '@angular/core';
/**
 * /*DEPRECATED:Emerald*/.js Components Index
 *
 * This file exports all /*DEPRECATED:Emerald*/.js component wrappers for easy importing.
 *
 * Documentation: https://docs-/*DEPRECATED:emerald*/.condorlabs.io/
 */

// Components
export * from './components/app-card/app-card.component';
export * from './components/avatar/avatar.component';
export * from './components/carousel/carousel.component';
export * from './components/info-panel/info-panel.component';
export * from './components/label/label.component';
export * from './components/page-header/page-header.component';
export * from './components/skeleton-loader/skeleton-loader.component';
export * from './components/toggle/toggle.component';

// New Components
export * from './components/card-grid/card-grid.component';
export * from './components/pager/pager.component';
export * from './components/floating-action-button/floating-action-button.component';
export * from './tinder-card/tinder-card.component';

// Interfaces
export type { DropdownItem } from './components/avatar/avatar.component';
export type { CarouselItem } from './components/carousel/carousel.component';
export type { InfoPanelItem } from './components/info-panel/info-panel.component';
export type { Breadcrumb, HeaderAction } from './components/page-header/page-header.component';
export type { TinderCardMedia, TinderCardAction } from './tinder-card/tinder-card.component';
