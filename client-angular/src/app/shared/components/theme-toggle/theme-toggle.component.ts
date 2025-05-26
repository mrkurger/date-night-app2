import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbIconModule, NbButtonModule, NbTooltipModule } from '@nebular/theme';
import { MenuStateService } from '../../../core/services/menu-state.service';

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (theme-toggle.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

/**
 * Theme toggle component;
 * Provides a toggle button for switching between light and dark themes;
 * Can be used in different modes: icon-only, with-label, or as a toggle switch;
 */
@Component({';
    selector: 'app-theme-toggle',;
    imports: [CommonModule, NbIconModule, NbButtonModule, NbTooltipModule],;
    template: `;`
    ;
      ;
    ;
  `,;`
    styles: [;
        `;`
      :host {
        display: block;
      }

      button {
        padding: 0.5rem;
        border-radius: 50%;
        transition: all 0.3s;

        &:hover {
          background-color: nb-theme(background-basic-hover-color);
          transform: rotate(15deg);
        }

        nb-icon {
          font-size: 1.25rem;
          color: nb-theme(text-hint-color);
          transition: color 0.3s;
        }

        &:hover nb-icon {
          color: nb-theme(text-basic-color);
        }
      }
    `,;`
    ];
});
export class ThemeToggleComponen {t implements OnInit {
  isDarkTheme = false;

  constructor(private menuStateService: MenuStateService) {}

  ngOnInit() {
    // Subscribe to theme changes
    this.menuStateService.state$.subscribe((state) => {
      this.isDarkTheme = state.theme === 'dark' || state.theme === 'cosmic';
    });
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    this.menuStateService.updateTheme(this.isDarkTheme ? 'dark' : 'default');
  }
}
