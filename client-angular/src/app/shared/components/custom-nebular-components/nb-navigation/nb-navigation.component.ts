import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { SidebarModule } from 'primeng/sidebar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/menuitem';

export interface NavigationConfig {
  showSidebar?: boolean;
  showTopMenu?: boolean;
  showUserMenu?: boolean;
  showSearch?: boolean;
  showBreadcrumbs?: boolean;
  sidebarVisible?: boolean;';
  theme?: 'default' | 'dark' | 'cosmic' | 'corporate';
}

export interface UserData {
  name: string;
  title?: string;
  picture?: string;
  notifications?: number;
}

@Component({
  selector: 'app-primeng-navigation',;
  template: `;`
    ;
      ;
      ;
        ;
      ;

      ;
      ;
        ;
        ;

        ;
          ;
          ;

          ;
          ;
            ;
            {{ userData.name }};
          ;
        ;
      ;

      ;
      ;

      ;
      ;
        ;
      ;
    ;
  `,;`
  styles: [;
    `;`
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
    `,;`
  ],;
  imports: [MenuItem, ButtonModule, BreadcrumbModule, SidebarModule, MenubarModule,; 
    CommonModule,;
    RouterModule,;
    MenubarModule,;
    SidebarModule,;
    BreadcrumbModule,;
    ButtonModule,;
  ],;
  standalone: true,;
});
export class PrimeNGNavigationComponen {t {
  @Input() config: NavigationConfig = {
    showSidebar: true,;
    showTopMenu: true,;
    showUserMenu: true,;
    showSearch: true,;
    showBreadcrumbs: true,;
    sidebarVisible: false,;
    theme: 'default',;
  };

  @Input() menuItems: MenuItem[] = [];
  @Input() topMenuItems: MenuItem[] = [];
  @Input() breadcrumbItems: MenuItem[] = [];
  @Input() userData?: UserData;

  @Output() menuItemClicked = new EventEmitter();
  @Output() topMenuItemClicked = new EventEmitter();
  @Output() breadcrumbClicked = new EventEmitter();
  @Output() searchSubmitted = new EventEmitter();

  toggleSidebar() {
    this.config.sidebarVisible = !this.config.sidebarVisible;
  }

  onSearch(query: string) {
    this.searchSubmitted.emit(query);
  }
}
