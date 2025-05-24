import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { SidebarModule } from 'primeng/sidebar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';

export interface NavigationConfig {
  showSidebar?: boolean;
  showTopMenu?: boolean;
  showUserMenu?: boolean;
  showSearch?: boolean;
  showBreadcrumbs?: boolean;
  sidebarVisible?: boolean;
  theme?: 'default' | 'dark' | 'cosmic' | 'corporate';
}

export interface UserData {
  name: string;
  title?: string;
  picture?: string;
  notifications?: number;
}

@Component({
  selector: 'app-primeng-navigation',
  template: `
    <div class="layout">
      <!-- Sidebar -->
      <p-sidebar
        *ngIf="config.showSidebar"
        [(visible)]="config.sidebarVisible"
        [baseZIndex]="1000"
        [modal]="true"
      >
        <p-panelMenu [model]="menuItems"></p-panelMenu>
      </p-sidebar>

      <!-- Header -->
      <div class="header">
        <button
          *ngIf="config.showSidebar"
          pButton
          icon="pi pi-bars"
          (click)="toggleSidebar()"
        ></button>
        <p-menubar *ngIf="config.showTopMenu" [model]="topMenuItems"></p-menubar>

        <div class="header-right">
          <!-- Search -->
          <input
            *ngIf="config.showSearch"
            type="text"
            pInputText
            placeholder="Search..."
            (input)="onSearch($event.target.value)"
          />

          <!-- User Menu -->
          <div *ngIf="config.showUserMenu && userData" class="user-menu">
            <img [src]="userData.picture" alt="User Picture" class="user-picture" />
            <span>{{ userData.name }}</span>
          </div>
        </div>
      </div>

      <!-- Breadcrumbs -->
      <p-breadcrumb *ngIf="config.showBreadcrumbs" [model]="breadcrumbItems"></p-breadcrumb>

      <!-- Content -->
      <div class="content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .layout {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .header {
        display: flex;
        align-items: center;
        padding: 1rem;
        background-color: var(--header-background-color);
        border-bottom: 1px solid var(--divider-color);
      }
      .header-right {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .user-menu {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .user-picture {
        width: 32px;
        height: 32px;
        border-radius: 50%;
      }
    `,
  ],
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule,
    SidebarModule,
    BreadcrumbModule,
    ButtonModule,
  ],
  standalone: true,
})
export class PrimeNGNavigationComponent {
  @Input() config: NavigationConfig = {
    showSidebar: true,
    showTopMenu: true,
    showUserMenu: true,
    showSearch: true,
    showBreadcrumbs: true,
    sidebarVisible: false,
    theme: 'default',
  };

  @Input() menuItems: MenuItem[] = [];
  @Input() topMenuItems: MenuItem[] = [];
  @Input() breadcrumbItems: MenuItem[] = [];
  @Input() userData?: UserData;

  @Output() menuItemClicked = new EventEmitter<MenuItem>();
  @Output() topMenuItemClicked = new EventEmitter<MenuItem>();
  @Output() breadcrumbClicked = new EventEmitter<MenuItem>();
  @Output() searchSubmitted = new EventEmitter<string>();

  toggleSidebar() {
    this.config.sidebarVisible = !this.config.sidebarVisible;
  }

  onSearch(query: string) {
    this.searchSubmitted.emit(query);
  }
}
