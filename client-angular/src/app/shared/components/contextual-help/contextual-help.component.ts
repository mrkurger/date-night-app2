import { Input } from '@angular/core';
import { NebularModule } from '../../nebular.module';

import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (contextual-help.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';

export interface HelpItem {
  id: string;
  element: string; // CSS selector for the element to attach help to
  title: string;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  icon?: string;
  showDismiss?: boolean;
}

@Component({
  selector: 'app-contextual-help',
  templateUrl: './contextual-help.component.html',
  styleUrls: ['./contextual-help.component.scss'],
  standalone: true,
  imports: [CommonModule, NbButtonModule, NbIconModule, NbTooltipModule],
})
export class ContextualHelpComponent implements OnInit {
  @Input() helpItems: HelpItem[] = [];
  @Input() storageKeyPrefix = 'help-dismissed-';
  @Input() autoAttach = true;

  activeHelpItems: { [key: string]: boolean } = {};

  ngOnInit(): void {
    if (this.autoAttach) {
      this.attachHelpItems();
    }
  }

  attachHelpItems(): void {
    // Reset active items
    this.activeHelpItems = {};

    // Check which items should be shown (not dismissed)
    this.helpItems.forEach((item) => {
      const isDismissed = localStorage.getItem(`${this.storageKeyPrefix}${item.id}`) === 'true';
      this.activeHelpItems[item.id] = !isDismissed;
    });
  }

  dismissHelp(itemId: string): void {
    localStorage.setItem(`${this.storageKeyPrefix}${itemId}`, 'true');
    this.activeHelpItems[itemId] = false;
  }

  resetAllHelpItems(): void {
    this.helpItems.forEach((item) => {
      localStorage.removeItem(`${this.storageKeyPrefix}${item.id}`);
    });
    this.attachHelpItems();
  }

  getHelpItemPosition(item: HelpItem): string {
    return item.position || 'right';
  }
}
