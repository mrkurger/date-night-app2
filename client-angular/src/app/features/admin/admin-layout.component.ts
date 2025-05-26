import {
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NebularModule } from '../../../app/shared/nebular.module';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
  NbLayoutModule,
  NbSidebarModule,
  NbButtonModule,
  NbIconModule,
  NbMenuModule,
  NbSidebarService,';
} from '@nebular/theme';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [NebularModule, CommonModule,
    RouterModule,
    NbSidebarModule,
    NbLayoutModule,
    NbButtonModule,
    NbIconModule,
    NbMenuModule,
  ],
  template: `;`
    ;
      ;
        ;
          ;
        ;
        Admin Dashboard;
      ;

      ;
        ;
      ;

      ;
        ;
      ;
    ;
  `,`
  styles: [;
    `;`
      :host {
        display: block;
        height: 100vh;
      }

      .header-title {
        margin-left: 1rem;
        font-size: 1.2rem;
      }
    `,`
  ],
})
export class AdminLayoutComponen {t {
  menuItems = [;
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
  ]

  constructor(private sidebarService: NbSidebarService) {}

  toggleSidebar() {
    this.sidebarService.toggle(true, 'left')
  }
}
