import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  NbLayoutModule,
  NbSidebarModule,
  NbButtonModule,
  NbIconModule,
  NbMenuModule,
  NbSidebarService,
} from '@nebular/theme';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    RouterModule,
    NbSidebarModule,
    NbLayoutModule,
    NbButtonModule,
    NbIconModule,
    NbMenuModule,
  ],
  template: `
    <nb-layout>
      <nb-layout-header fixed>
        <button nbButton ghost (click)="toggleSidebar()">
          <nb-icon icon="menu-outline"></nb-icon>
        </button>
        <span class="header-title">Admin Dashboard</span>
      </nb-layout-header>

      <nb-sidebar>
        <nb-menu [items]="menuItems"></nb-menu>
      </nb-sidebar>

      <nb-layout-column>
        <router-outlet></router-outlet>
      </nb-layout-column>
    </nb-layout>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
      }

      .header-title {
        margin-left: 1rem;
        font-size: 1.2rem;
      }
    `,
  ],
})
export class AdminLayoutComponent {
  menuItems = [
    {
      title: 'User Management',
      icon: 'people-outline',
      link: './users',
    },
    {
      title: 'Revenue Analytics',
      icon: 'trending-up-outline',
      link: './revenue',
    },
    {
      title: 'System Health',
      icon: 'activity-outline',
      link: './system-health',
    },
    {
      title: 'Error & Security',
      icon: 'shield-outline',
      link: './error-security',
    },
    {
      title: 'Content Moderation',
      icon: 'eye-outline',
      link: './moderation',
    },
    {
      title: 'Audit Log',
      icon: 'file-text-outline',
      link: './audit-log',
    },
    {
      title: 'Settings',
      icon: 'settings-2-outline',
      link: './settings',
    },
  ];

  constructor(private sidebarService: NbSidebarService) {}

  toggleSidebar() {
    this.sidebarService.toggle(true, 'left');
  }
}
