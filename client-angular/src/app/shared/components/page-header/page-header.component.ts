import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NbButtonModule, NbIconModule } from '@nebular/theme';

export interface Breadcrumb {
  title: string;
  link?: string[];
  icon?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule, NbButtonModule, NbIconModule],
  template: `
    <div class="page-header">
      <div class="page-header__breadcrumbs" *ngIf="breadcrumbs?.length">
        <nav class="breadcrumbs">
          <ul class="breadcrumbs__list">
            <li *ngFor="let item of breadcrumbs; let last = last" class="breadcrumbs__item">
              <a *ngIf="!last && item.link" [routerLink]="item.link" class="breadcrumbs__link">
                <nb-icon *ngIf="item.icon" [icon]="item.icon"></nb-icon>
                {{ item.title }}
              </a>
              <span *ngIf="!last && !item.link" class="breadcrumbs__text">
                <nb-icon *ngIf="item.icon" [icon]="item.icon"></nb-icon>
                {{ item.title }}
              </span>
              <span *ngIf="last" class="breadcrumbs__current">
                <nb-icon *ngIf="item.icon" [icon]="item.icon"></nb-icon>
                {{ item.title }}
              </span>
              <nb-icon
                *ngIf="!last"
                icon="chevron-right-outline"
                class="breadcrumbs__separator"
              ></nb-icon>
            </li>
          </ul>
        </nav>
      </div>

      <div class="page-header__content">
        <div class="page-header__title-group">
          <nb-icon *ngIf="icon" [icon]="icon" class="page-header__icon"></nb-icon>
          <h1 class="page-header__title">{{ title }}</h1>
          <p *ngIf="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
        </div>

        <div class="page-header__actions">
          <ng-content select="[actions]"></ng-content>
        </div>
      </div>

      <div class="page-header__tabs" *ngIf="showTabs">
        <ng-content select="[tabs]"></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        margin-bottom: var(--margin);
      }

      .page-header {
        background-color: var(--card-background-color);
        border-radius: var(--card-border-radius);
        padding: var(--card-padding);
        box-shadow: var(--shadow);
      }

      .page-header__breadcrumbs {
        margin-bottom: var(--margin);
      }

      .breadcrumbs {
        color: var(--text-hint-color);
      }

      .breadcrumbs__list {
        display: flex;
        align-items: center;
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .breadcrumbs__item {
        display: flex;
        align-items: center;
      }

      .breadcrumbs__link {
        display: flex;
        align-items: center;
        color: var(--text-hint-color);
        text-decoration: none;
        transition: color 0.2s;

        &:hover {
          color: var(--text-basic-color);
        }
      }

      .breadcrumbs__text {
        display: flex;
        align-items: center;
      }

      .breadcrumbs__current {
        display: flex;
        align-items: center;
        color: var(--text-basic-color);
        font-weight: 600;
      }

      .breadcrumbs__separator {
        margin: 0 var(--spacing-xs);
        color: var(--text-hint-color);
      }

      .page-header__content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: var(--spacing);
        margin-bottom: var(--margin);
      }

      .page-header__title-group {
        display: flex;
        align-items: center;
        gap: var(--spacing);
      }

      .page-header__icon {
        font-size: 2rem;
        color: var(--text-hint-color);
      }

      .page-header__title {
        margin: 0;
        color: var(--text-basic-color);
        font-size: var(--text-heading-1-font-size);
        font-weight: var(--text-heading-1-font-weight);
        line-height: var(--text-heading-1-line-height);
      }

      .page-header__subtitle {
        margin: 0;
        color: var(--text-hint-color);
        font-size: var(--text-subtitle-font-size);
        line-height: var(--text-subtitle-line-height);
      }

      .page-header__actions {
        display: flex;
        gap: var(--spacing);
      }

      .page-header__tabs {
        margin-top: var(--margin);
      }

      @media (max-width: 768px) {
        .page-header__content {
          flex-direction: column;
          align-items: stretch;
        }

        .page-header__actions {
          margin-top: var(--margin);
        }

        .breadcrumbs__list {
          flex-wrap: wrap;
        }
      }
    `,
  ],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() breadcrumbs?: Breadcrumb[];
  @Input() showTabs = false;
}
