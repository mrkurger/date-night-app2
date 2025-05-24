import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/menuitem';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { MenubarModule } from 'primeng/menubar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
export interface NavigationConfig {
  showSidebar?: boolean;
  showTopMenu?: boolean;
  showUserMenu?: boolean;
  showSearch?: boolean;
  showBreadcrumbs?: boolean;
  sidebarState?: 'expanded' | 'collapsed' | 'compacted';
  theme?: 'light' | 'dark';
  responsive?: boolean;
  fixed?: boolean;
  sidebarRight?: boolean;
}

export interface UserData {
  name: string;
  title?: string;
  picture?: string;
  notifications?: number;
}

@Component({
  selector: 'app-navigation',
  template: `
    <div class="layout-wrapper" [class.layout-sidebar-active]="sidebarVisible">
      <!-- Sidebar -->
      <p-sidebar 
        [(visible)]="sidebarVisible"
        [position]="config.sidebarRight ? 'right' : 'left'"
        [showCloseIcon]="false"
        [modal]="false"
        [baseZIndex]="1000"
        styleClass="layout-sidebar"
      >
        <p-menu 
          [model]="menuItems"
          [styleClass]="config.sidebarState === 'compacted' ? 'layout-menu compact' : 'layout-menu'"
          (click)="onMenuItemClick($event)"
        ></p-menu>
      </p-sidebar>

      <!-- Header -->
      <div class="layout-header" [class.fixed]="config.fixed !== false">
        <div class="header-container">
          <!-- Sidebar Toggle -->
          <button 
            *ngIf="config.showSidebar"
            pButton
            icon="pi pi-bars"
            (click)="toggleSidebar()"
            class="p-button-text p-button-rounded"
          ></button>

          <!-- Top Menu -->
          <p-menubar
            *ngIf="config.showTopMenu"
            [model]="topMenuItems"
            styleClass="layout-topbar"
          ></p-menubar>

          <div class="header-right">
            <!-- Search -->
            <p-autoComplete
              *ngIf="config.showSearch"
              [(ngModel)]="searchQuery"
              [suggestions]="[]"
              (completeMethod)="onSearch($event)"
              (onSelect)="onSearchSelect($event)"
              placeholder="Search..."
              [style]="{ width: '100%', maxWidth: '250px' }"
            ></p-autoComplete>

            <!-- User Menu -->
            <div *ngIf="config.showUserMenu && userData" class="user-menu">
              <button 
                #userMenuBtn
                pButton
                class="p-button-text p-button-rounded user-button"
                [pTooltip]="userData.name"
              >
                <p-avatar 
                  [image]="userData.picture"
                  [label]="userData.name?.charAt(0)"
                  shape="circle"
                  size="normal"
                  [style]="{ 'margin-right': '.5rem' }"
                ></p-avatar>
                <span class="user-name">{{ userData.name }}</span>
                <i class="pi pi-angle-down" style="margin-left: .5rem"></i>
              </button>
              <p-menu
                #userMenu
                [popup]="true"
                [model]="userMenuItems"
                [style]="{ width: '200px' }"
                (click)="onUserMenuItemClick($event)"
              ></p-menu>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="layout-main">
        <!-- Breadcrumbs -->
        <p-breadcrumb
          *ngIf="config.showBreadcrumbs"
          [model]="breadcrumbItems"
          [home]="{ icon: 'pi pi-home' }"
          (onItemClick)="onBreadcrumbClick($event)"
          styleClass="layout-breadcrumb"
        ></p-breadcrumb>

        <!-- Content -->
        <div class="layout-content">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        <div class="layout-footer" [class.fixed]="config.fixed !== false">
          <ng-content select="[footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }

    .layout-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: var(--surface-ground);
    }

    .layout-header {
      background-color: var(--surface-card);
      border-bottom: 1px solid var(--surface-border);
      padding: 0;
      position: relative;
      z-index: 999;
    }

    .layout-header.fixed {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
    }

    .header-container {
      display: flex;
      align-items: center;
      padding: 0 1.25rem;
      height: 4rem;
    }

    .header-right {
      display: flex;
      align-items: center;
      margin-left: auto;
      gap: 1rem;
    }

    .layout-sidebar {
      height: 100vh;
      position: fixed;
      top: 0;
      background-color: var(--surface-overlay);
      border-right: 1px solid var(--surface-border);
      transition: transform .3s;
    }

    .layout-main {
      flex: 1;
      padding-top: 4rem;
      margin-left: var(--sidebar-width, 250px);
      transition: margin-left .3s;
    }

    .layout-sidebar-active .layout-main {
      margin-left: 0;
    }

    .layout-content {
      padding: 2rem;
    }

    .layout-footer {
      background-color: var(--surface-card);
      border-top: 1px solid var(--surface-border);
      padding: 1rem;
    }

    .layout-footer.fixed {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
    }

    .user-menu {
      display: flex;
      align-items: center;
    }

    .user-button {
      display: flex;
      align-items: center;
      padding: .5rem 1rem;
    }

    .user-name {
      display: none;
    }

    @media screen and (min-width: 768px) {
      .user-name {
        display: inline;
      }
    }

    :host ::ng-deep {
      .layout-menu.compact {
        .p-menu-list {
          padding: 0;
        }

        .p-menuitem-text,
        .p-submenu-icon {
          display: none;
        }

        .p-menuitem-icon {
          margin-right: 0;
          font-size: 1.25rem;
        }
      }
    }
  `],
  imports: [RippleModule, MenuModule, AvatarModule, AutoCompleteModule, BreadcrumbModule, MenubarModule, SidebarModule, ButtonModule, MenuItem, 
    CommonModule,
    RouterModule,
    ButtonModule,
    SidebarModule,
    MenubarModule,
    BreadcrumbModule,
    AutoCompleteModule,
    AvatarModule,
    MenuModule,
    RippleModule,
  ],
  standalone: true
})
export class NavigationComponent {
  @Input() config: NavigationConfig = {
    showSidebar: true,
    showTopMenu: true,
    showUserMenu: true,
    showSearch: true,
    showBreadcrumbs: true,
    sidebarState: 'expanded',
    theme: 'light',
  };

  @Input() menuItems: MenuItem[] = [];
  @Input() topMenuItems: MenuItem[] = [];
  @Input() userMenuItems: MenuItem[] = [];
  @Input() breadcrumbItems: MenuItem[] = [];
  @Input() userData?: UserData;

  @Output() menuItemClicked = new EventEmitter<MenuItem>();
  @Output() topMenuItemClicked = new EventEmitter<MenuItem>();
  @Output() userMenuItemClicked = new EventEmitter<MenuItem>();
  @Output() breadcrumbClicked = new EventEmitter<MenuItem>();
  @Output() searchSubmitted = new EventEmitter<string>();
  @Output() sidebarStateChanged = new EventEmitter<string>();

  sidebarVisible = true;
  searchQuery = '';

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    const newState = this.sidebarVisible ? 'expanded' : 'collapsed';
    this.config.sidebarState = newState;
    this.sidebarStateChanged.emit(newState);
  }

  onMenuItemClick(event: any) {
    const item = event.item as MenuItem;
    if (item) {
      this.menuItemClicked.emit(item);
    }
  }

  onTopMenuItemClick(event: any) {
    const item = event.item as MenuItem;
    if (item) {
      this.topMenuItemClicked.emit(item);
    }
  }

  onUserMenuItemClick(event: any) {
    const item = event.item as MenuItem;
    if (item) {
      this.userMenuItemClicked.emit(item);
    }
  }

  onBreadcrumbClick(event: any) {
    const item = event.item as MenuItem;
    if (item) {
      this.breadcrumbClicked.emit(item);
    }
  }

  onSearch(event: any) {
    this.searchSubmitted.emit(event.query);
  }

  onSearchSelect(event: any) {
    this.searchSubmitted.emit(event);
  }
}
