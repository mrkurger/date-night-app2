import { Component, Input } from '@angular/core';
import { NebularModule } from '../../nebular.module';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
  title: string;
  link?: string[];
  icon?: string;
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterModule, NbIconModule],
  template: `
    <nav class="breadcrumbs" aria-label="breadcrumb">
      <ol>
        <li *ngFor="let item of items; let last = last" [class.active]="last">
          <a [routerLink]="item.link" *ngIf="item.link && !last">
            <nb-icon [icon]="item.icon" *ngIf="item.icon"></nb-icon>
            {{ item.title }}
          </a>
          <ng-container *ngIf="!item.link || last">
            <nb-icon [icon]="item.icon" *ngIf="item.icon"></nb-icon>
            {{ item.title }}
          </ng-container>
          <span class="separator" *ngIf="!last">
            <nb-icon icon="chevron-right-outline"></nb-icon>
          </span>
        </li>
      </ol>
    </nav>
  `,
  styles: [
    `
      .breadcrumbs {
        padding: var(--padding);

        ol {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          padding: 0;
          margin: 0;
          list-style: none;
        }

        li {
          display: flex;
          align-items: center;
          color: var(--text-hint-color);
          font-size: 0.875rem;

          &.active {
            color: var(--text-basic-color);
          }

          a {
            display: flex;
            align-items: center;
            color: var(--text-hint-color);
            text-decoration: none;
            transition: color var(--transition-duration);

            &:hover {
              color: var(--text-primary-hover-color);
            }
          }

          nb-icon {
            margin-right: var(--spacing-xs);
            font-size: 1rem;
          }

          .separator {
            display: flex;
            align-items: center;
            margin: 0 var(--spacing-xs);
            color: var(--text-hint-color);

            nb-icon {
              margin: 0;
              font-size: 0.875rem;
            }
          }
        }
      }
    `,
  ],
})
export class BreadcrumbsComponent {
  @Input() items: Breadcrumb[] = [];
}
