// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for app-routing.module settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SelectivePreloadingStrategy } from './core/strategies/selective-preloading.strategy';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.module').then((m) => m.ProfileModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'ads',
    loadChildren: () =>
      import('./features/ad-management/ad-management.module').then((m) => m.AdManagementModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then((m) => m.AdminModule),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
  },
  {
    path: '',
    redirectTo: '/browse',
    pathMatch: 'full',
  },
];

/**
 * @deprecated This module is being phased out in favor of the standalone component approach.
 * See app.config.ts and app.routes.ts for the new routing configuration.
 *
 * This module is kept for backward compatibility during the transition period.
 * New routes should be added to app.routes.ts.
 */
@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: SelectivePreloadingStrategy,
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      initialNavigation: 'enabledBlocking', // for SSR
    }),
  ],
  exports: [RouterModule],
  providers: [SelectivePreloadingStrategy],
})
export class AppRoutingModule {}
