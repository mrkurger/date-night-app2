import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NbMenuItem } from '@nebular/theme';

export interface NavigationConfig {
  showSidebar?: boolean;
  showTopMenu?: boolean;
  showUserMenu?: boolean;
  showSearch?: boolean;
  showBreadcrumbs?: boolean;
  sidebarState?: 'expanded' | 'collapsed' | 'compacted';
  theme?: 'default' | 'dark' | 'cosmic' | 'corporate';
}

export interface UserData {
  name: string;
  title?: string;
  picture?: string;
  notifications?: number;
}

@Component({
  selector: 'nb-navigation',
  template: `
    <nb-layout>
      <!-- Sidebar -->
      <nb-sidebar
        *ngIf="config.showSidebar"
        [state]="config.sidebarState || 'expanded'"
        [responsive]="true"
        [compacted]="config.sidebarState === 'compacted'"
      >
        <nb-side-menu
          [items]="menuItems"
          [compact]="config.sidebarState === 'compacted'"
          (itemClick)="onMenuItemClick($event)"
        ></nb-side-menu>
      </nb-sidebar>

      <!-- Header -->
      <nb-layout-header fixed>
        <div class="header-container">
          <!-- Sidebar Toggle -->
          <button *ngIf="config.showSidebar" nbButton ghost (click)="toggleSidebar()">
            <nb-icon icon="menu-2-outline"></nb-icon>
          </button>

          <!-- Top Menu -->
          <nb-top-menu
            *ngIf="config.showTopMenu"
            [items]="topMenuItems"
            (itemClick)="onTopMenuItemClick($event)"
          ></nb-top-menu>

          <div class="header-right">
            <!-- Search -->
            <nb-search-bar *ngIf="config.showSearch" (search)="onSearch($event)"></nb-search-bar>

            <!-- User Menu -->
            <nb-user-menu
              *ngIf="config.showUserMenu && userData"
              [userData]="userData"
              [items]="userMenuItems"
              (itemClick)="onUserMenuItemClick($event)"
            ></nb-user-menu>
          </div>
        </div>
      </nb-layout-header>

      <!-- Main Content -->
      <nb-layout-column>
        <!-- Breadcrumbs -->
        <nb-breadcrumbs
          *ngIf="config.showBreadcrumbs"
          [items]="breadcrumbItems"
          (itemClick)="onBreadcrumbClick($event)"
        ></nb-breadcrumbs>

        <!-- Content -->
        <ng-content></ng-content>
      </nb-layout-column>

      <!-- Footer -->
      <nb-layout-footer fixed>
        <ng-content select="[footer]"></ng-content>
      </nb-layout-footer>
    </nb-layout>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .header-container {
        display: flex;
        align-items: center;
        width: 100%;
        height: 100%;
        padding: 0 1.25rem;
      }

      .header-right {
        display: flex;
        align-items: center;
        margin-left: auto;
        gap: 1rem;
      }

      nb-layout-header {
        background-color: nb-theme(header-background-color);
        border-bottom: 1px solid nb-theme(divider-color);
      }

      nb-sidebar {
        background-color: nb-theme(sidebar-background-color);
        border-right: 1px solid nb-theme(divider-color);
      }

      nb-layout-footer {
        background-color: nb-theme(footer-background-color);
        border-top: 1px solid nb-theme(divider-color);
      }
    `,
  ],
})
export class NbNavigationComponent {
  @Input() config: NavigationConfig = {
    showSidebar: true,
    showTopMenu: true,
    showUserMenu: true,
    showSearch: true,
    showBreadcrumbs: true,
    sidebarState: 'expanded',
    theme: 'default',
  };

  @Input() menuItems: NbMenuItem[] = [];
  @Input() topMenuItems: NbMenuItem[] = [];
  @Input() userMenuItems: NbMenuItem[] = [];
  @Input() breadcrumbItems: NbMenuItem[] = [];
  @Input() userData?: UserData;

  @Output() menuItemClicked = new EventEmitter<NbMenuItem>();
  @Output() topMenuItemClicked = new EventEmitter<NbMenuItem>();
  @Output() userMenuItemClicked = new EventEmitter<NbMenuItem>();
  @Output() breadcrumbClicked = new EventEmitter<NbMenuItem>();
  @Output() searchSubmitted = new EventEmitter<string>();
  @Output() sidebarStateChanged = new EventEmitter<string>();

  toggleSidebar() {
    const currentState = this.config.sidebarState;
    let newState: 'expanded' | 'collapsed' | 'compacted';

    switch (currentState) {
      case 'expanded':
        newState = 'compacted';
        break;
      case 'compacted':
        newState = 'collapsed';
        break;
      case 'collapsed':
        newState = 'expanded';
        break;
      default:
        newState = 'expanded';
    }

    this.config = { ...this.config, sidebarState: newState };
    this.sidebarStateChanged.emit(newState);
  }

  onMenuItemClick(item: NbMenuItem) {
    this.menuItemClicked.emit(item);
  }

  onTopMenuItemClick(item: NbMenuItem) {
    this.topMenuItemClicked.emit(item);
  }

  onUserMenuItemClick(item: NbMenuItem) {
    this.userMenuItemClicked.emit(item);
  }

  onBreadcrumbClick(item: NbMenuItem) {
    this.breadcrumbClicked.emit(item);
  }

  onSearch(query: string) {
    this.searchSubmitted.emit(query);
  }
}
