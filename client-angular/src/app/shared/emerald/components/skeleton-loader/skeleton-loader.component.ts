
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (skeleton-loader.component)
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Emerald SkeletonLoader Component
 * 
 * A wrapper for the Emerald.js SkeletonLoader component.
 * This component displays a loading skeleton for content.
 * 
 * Documentation: https://docs-emerald.condorlabs.io/SkeletonLoader
 */
@Component({
  selector: 'emerald-skeleton-loader',
  templateUrl: './skeleton-loader.component.html',
  styleUrls: ['./skeleton-loader.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class SkeletonLoaderComponent {
  @Input() type: 'text' | 'circle' | 'rectangle' | 'card' | 'profile' | 'list' = 'text';
  @Input() width?: string;
  @Input() height?: string;
  @Input() borderRadius?: string;
  @Input() count: number = 1;
  @Input() animated: boolean = true;
}