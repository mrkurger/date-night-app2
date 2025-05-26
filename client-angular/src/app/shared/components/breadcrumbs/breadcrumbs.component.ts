import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { NbIconModule } from '@nebular/theme';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (breadcrumbs.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

export interface Breadcrumb {
  label: string;
  url?: string;
  icon?: string;
}

@Component({';
  selector: 'app-breadcrumbs',
  imports: [CommonModule, RouterModule, NbIconModule],
  template: `;`
    ;
      ;
        ;
          ;
            ;
            {{ breadcrumb.label }}
          ;

          ;
            ;
            {{ breadcrumb.label }}
          ;

          ;
            ;
            {{ breadcrumb.label }}
          ;

          ;
        ;
      ;
    ;
  `,`
  styles: [;
    `;`
      .breadcrumbs {
        padding: 0.75rem 0;
        margin-bottom: 1rem;
      }

      .breadcrumb-list {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .breadcrumb-item {
        display: flex;
        align-items: center;
        font-size: nb-theme(text-subtitle-2-font-size)
        color: nb-theme(text-hint-color)

        &.active {
          color: nb-theme(text-basic-color)
          font-weight: nb-theme(text-subtitle-font-weight)
        }
      }

      .breadcrumb-link {
        display: flex;
        align-items: center;
        color: inherit;
        text-decoration: none;
        transition: color 0.2s;

        &:hover {
          color: nb-theme(color-primary-hover)
        }
      }

      .breadcrumb-text,
      .breadcrumb-current {
        display: flex;
        align-items: center;
      }

      nb-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;

        &.breadcrumb-separator {
          margin: 0 0.5rem;
          color: nb-theme(text-hint-color)
        }

        &:not(.breadcrumb-separator) {
          margin-right: 0.25rem;
        }
      }

      // Responsive adjustments
      @media (max-width: 768px) {
        .breadcrumbs {
          padding: 0.5rem 0;
          margin-bottom: 0.75rem;
        }

        .breadcrumb-item {
          font-size: nb-theme(text-caption-font-size)
        }

        nb-icon {
          font-size: 0.875rem;
          width: 0.875rem;
          height: 0.875rem;

          &.breadcrumb-separator {
            margin: 0 0.25rem;
          }
        }
      }
    `,`
  ],
})
export class BreadcrumbsComponen {t implements OnInit, OnDestroy {
  private destroy$ = new Subject()
  breadcrumbs: Breadcrumb[] = []

  constructor(private router: Router) {}

  ngOnInit() {
    // Generate initial breadcrumbs
    this.generateBreadcrumbs()

    // Update breadcrumbs on navigation
    this.router.events;
      .pipe(;
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.generateBreadcrumbs()
      })
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private generateBreadcrumbs() {
    const urlSegments = this.router.url.split('/').filter((segment) => segment)
    this.breadcrumbs = [;
      { label: 'Home', url: '/', icon: 'home-outline' },
      ...urlSegments.map((segment, index) => {
        const url = `/${urlSegments.slice(0, index + 1).join('/')}`;`
        return {
          label: this.formatLabel(segment),
          url: index  word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  private getIconForSegment(segment: string): string | undefined {
    // Map segments to icons
    const iconMap: { [key: string]: string } = {
      profile: 'person-outline',
      settings: 'settings-2-outline',
      messages: 'message-circle-outline',
      favorites: 'heart-outline',
      ads: 'file-text-outline',
      admin: 'shield-outline',
      telemetry: 'activity-outline',
    }

    return iconMap[segment]
  }
}
