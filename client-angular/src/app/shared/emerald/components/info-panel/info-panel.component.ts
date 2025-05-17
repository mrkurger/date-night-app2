import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { NebularModule } from '../../../shared/nebular.module';

import { CommonModule } from '@angular/common';
import {
  NbProgressBarModule,
  
} from '@nebular/theme';

/**
 * InfoPanel Component
 *
 * This component displays information in a structured panel format.
 * It uses Nebular UI components for consistent styling.
 */

@Component({
  selector: 'app-info-panel',
  templateUrl: './info-panel.component.html',
  styleUrls: ['./info-panel.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NbCardModule,
    NbIconModule,
    NbBadgeModule,
    NbProgressBarModule,
    NbAccordionModule,
  ],
})
export class InfoPanelComponent implements OnInit {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() items: InfoPanelItem[] = [];
  @Input() variant: 'default' | 'bordered' | 'shadowed' = 'default';
  @Input() collapsible = false;
  @Input() initiallyCollapsed = false;

  isCollapsed = false;

  constructor(private readonly cd: ChangeDetectorRef) {
    // Inject ChangeDetectorRef for better change detection control
  }

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

  /**
   * Convert Font Awesome icon classes to Nebular icon names
   * This method maps Font Awesome icons to Nebular's Eva Icons
   */
  getIconName(iconClass: string): string {
    // Map common Font Awesome icons to Eva Icons
    const iconMap: Record<string, string> = {
      'fa-info-circle': 'info-outline',
      'fa-check-circle': 'checkmark-circle-2-outline',
      'fa-exclamation-circle': 'alert-circle-outline',
      'fa-question-circle': 'question-mark-circle-outline',
      'fa-user': 'person-outline',
      'fa-users': 'people-outline',
      'fa-calendar': 'calendar-outline',
      'fa-clock': 'clock-outline',
      'fa-map-marker': 'pin-outline',
      'fa-envelope': 'email-outline',
      'fa-phone': 'phone-outline',
      'fa-link': 'link-2-outline',
      'fa-file': 'file-outline',
      'fa-download': 'download-outline',
      'fa-upload': 'upload-outline',
      'fa-cog': 'settings-outline',
      'fa-star': 'star-outline',
      'fa-heart': 'heart-outline',
      'fa-bell': 'bell-outline',
      'fa-home': 'home-outline',
      'fa-check': 'checkmark-outline',
      'fa-times': 'close-outline',
      'fa-plus': 'plus-outline',
      'fa-minus': 'minus-outline',
      'fa-edit': 'edit-outline',
      'fa-trash': 'trash-2-outline',
      'fa-search': 'search-outline',
      'fa-filter': 'funnel-outline',
      'fa-sort': 'swap-outline',
      'fa-chart-bar': 'bar-chart-outline',
      'fa-chart-line': 'trending-up-outline',
      'fa-chart-pie': 'pie-chart-outline',
      'fa-lock': 'lock-outline',
      'fa-unlock': 'unlock-outline',
      'fa-key': 'key-outline',
      'fa-tag': 'pricetags-outline',
      'fa-tags': 'pricetags-outline',
      'fa-bookmark': 'bookmark-outline',
      'fa-flag': 'flag-outline',
      'fa-thumbs-up': 'thumbs-up-outline',
      'fa-thumbs-down': 'thumbs-down-outline',
      'fa-comment': 'message-square-outline',
      'fa-comments': 'message-circle-outline',
      'fa-share': 'share-outline',
      'fa-sync': 'sync-outline',
      'fa-undo': 'undo-outline',
      'fa-redo': 'redo-outline',
      'fa-copy': 'copy-outline',
      'fa-paste': 'clipboard-outline',
      'fa-save': 'save-outline',
      'fa-print': 'printer-outline',
      'fa-camera': 'camera-outline',
      'fa-video': 'video-outline',
      'fa-image': 'image-outline',
      'fa-music': 'music-outline',
      'fa-volume-up': 'volume-up-outline',
      'fa-volume-down': 'volume-down-outline',
      'fa-volume-mute': 'volume-off-outline',
      'fa-play': 'play-circle-outline',
      'fa-pause': 'pause-circle-outline',
      'fa-stop': 'stop-circle-outline',
      'fa-forward': 'skip-forward-outline',
      'fa-backward': 'skip-back-outline',
      'fa-chevron-left': 'chevron-left-outline',
      'fa-chevron-right': 'chevron-right-outline',
      'fa-chevron-up': 'chevron-up-outline',
      'fa-chevron-down': 'chevron-down-outline',
      'fa-arrow-left': 'arrow-back-outline',
      'fa-arrow-right': 'arrow-forward-outline',
      'fa-arrow-up': 'arrow-upward-outline',
      'fa-arrow-down': 'arrow-downward-outline',
      'fas fa-info-circle': 'info-outline',
      'fas fa-check-circle': 'checkmark-circle-2-outline',
      'fas fa-exclamation-circle': 'alert-circle-outline',
      'fas fa-question-circle': 'question-mark-circle-outline',
    };

    // Extract the icon name from the class (handles both 'fa-icon' and 'fas fa-icon' formats)
    const iconName = iconClass.includes('fa-') ? iconClass.split('fa-')[1].trim() : iconClass;

    // Return the mapped icon or a default if not found
    return iconMap[iconClass] || iconMap[`fa-${iconName}`] || 'question-mark-circle-outline';
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
