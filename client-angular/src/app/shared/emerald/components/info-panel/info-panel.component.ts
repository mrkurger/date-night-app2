import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Emerald InfoPanel Component
 * 
 * A wrapper for the Emerald.js InfoPanel component.
 * This component displays information in a structured panel format.
 * 
 * Documentation: https://docs-emerald.condorlabs.io/InfoPanel
 */

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for the InfoPanel component
// 
// COMMON CUSTOMIZATIONS:
// - variant: Visual style of the panel (default: 'default')
//   Valid values: 'default', 'bordered', 'shadowed'
// - collapsible: Whether the panel can be collapsed (default: false)
//   Valid values: true, false
// - initiallyCollapsed: Whether the panel starts collapsed (default: false)
//   Valid values: true, false
// - items: Array of InfoPanelItem objects to display
//   Related to: InfoPanelItem interface
// ===================================================

@Component({
  selector: 'emerald-info-panel',
  templateUrl: './info-panel.component.html',
  styleUrls: ['./info-panel.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class InfoPanelComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() items: InfoPanelItem[] = [];
  @Input() variant: 'default' | 'bordered' | 'shadowed' = 'default';
  @Input() collapsible: boolean = false;
  @Input() initiallyCollapsed: boolean = false;
  
  isCollapsed = false;
  
  constructor() { }
  
  ngOnInit(): void {
    this.isCollapsed = this.initiallyCollapsed;
  }
  
  /**
   * Toggle the panel's collapsed state
   */
  toggleCollapse(): void {
    if (this.collapsible) {
      this.isCollapsed = !this.isCollapsed;
    }
  }
}

/**
 * InfoPanel Item Interface
 */
export interface InfoPanelItem {
  label: string;
  value: string | number | boolean;
  icon?: string;
  type?: 'text' | 'badge' | 'progress' | 'boolean';
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}