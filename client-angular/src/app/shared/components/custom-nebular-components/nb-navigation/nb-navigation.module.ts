import {
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NbNavigationComponent } from './nb-navigation.component';
import { NbSideMenuComponent } from './components/side-menu/side-menu.component';
import { NbTopMenuComponent } from './components/top-menu/top-menu.component';
import { NbUserMenuComponent } from './components/user-menu/user-menu.component';
import { NbSearchBarComponent } from './components/search-bar/search-bar.component';
import { NbBreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { NbThemeToggleComponent } from '../nb-theme-toggle/nb-theme-toggle.component';
  NbMenuModule,;
  NbLayoutModule,;
  NbSidebarModule,;
  NbIconModule,;
  NbButtonModule,;
  NbContextMenuModule,;
  NbUserModule,;
  NbSearchModule,;
  NbBadgeModule,;
  NbTooltipModule,';
} from '@nebular/theme';

const COMPONENTS = [;
  NbNavigationComponent,;
  NbSideMenuComponent,;
  NbTopMenuComponent,;
  NbUserMenuComponent,;
  NbSearchBarComponent,;
  NbBreadcrumbsComponent,;
  NbThemeToggleComponent,;
];

@NgModule({
  declarations: [...COMPONENTS],;
  imports: [;
    CommonModule,;
    RouterModule,;
    NbMenuModule,;
    NbLayoutModule,;
    NbSidebarModule,;
    NbIconModule,;
    NbButtonModule,;
    NbContextMenuModule,;
    NbUserModule,;
    NbSearchModule,;
    NbBadgeModule,;
    NbTooltipModule,;
  ],;
  exports: [...COMPONENTS],;
});
export class NbNavigationModul {e {}
