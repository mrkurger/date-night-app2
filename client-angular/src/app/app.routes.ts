import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { SelectivePreloadingStrategy } from './core/strategies/selective-preloading.strategy';

export const routes: Routes = [
  // Primary routes - modern standalone components
  {
    path: '',
    loadComponent: () => import('./features/browse/browse.component').then(m => m.BrowseComponent),
    data: { preload: true, title: 'Browse Ads' },
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
    data: { preload: true, title: 'Authentication' },
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/user-settings/user-settings.component').then(m => m.UserSettingsComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'ad-details/:id',
    loadChildren: () =>
      import('./features/ad-details/ad-details.module').then(m => m.AdDetailsModule),
  },
  {
    path: 'advertiser/:id',
    loadComponent: () =>
      import('./features/advertiser-profile/advertiser-profile.component').then(
        m => m.AdvertiserProfileComponent
      ),
  },
  {
    path: 'ad-management',
    loadChildren: () =>
      import('./features/ad-management/ad-management.module').then(m => m.AdManagementModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'my-ads',
    loadChildren: () =>
      import('./features/ad-management/ad-management.module').then(m => m.AdManagementModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'chat',
    loadChildren: () => import('./features/chat/chat.module').then(m => m.ChatModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'gallery',
    loadComponent: () =>
      import('./features/gallery/gallery.component').then(m => m.GalleryComponent),
    canActivate: [AuthGuard],
  },

  // View-specific routes
  {
    path: 'browse',
    loadComponent: () =>
      import('./features/netflix-view/netflix-view.component').then(m => m.NetflixViewComponent),
    data: { title: 'Browse Ads - Netflix Style' },
  },
  {
    path: 'swipe',
    loadComponent: () => import('./features/tinder/tinder.component').then(m => m.TinderComponent),
    data: { title: 'Swipe Ads - Tinder Style' },
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./features/list-view/list-view.component').then(m => m.ListViewComponent),
    data: { title: 'List View' },
  },

  // Legacy routes - to be migrated to standalone components
  {
    path: 'ads',
    loadChildren: () => import('./features/ads/ads.module').then(m => m.AdsModule),
  },
  {
    path: 'ad-browser',
    loadChildren: () =>
      import('./features/ad-browser/ad-browser.module').then(m => m.AdBrowserModule),
    data: { preload: true, title: 'Browse Ads' },
  },
  // Tinder module temporarily disabled
  // {
  //   path: 'tinder',
  //   loadChildren: () => import('./features/tinder/tinder.module').then(m => m.TinderModule),
  // },
  {
    path: 'payment',
    loadChildren: () => import('./features/payment/payment.module').then(m => m.PaymentModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'wallet',
    loadChildren: () => import('./features/wallet/wallet.module').then(m => m.WalletModule),
    canActivate: [AuthGuard],
    data: { title: 'My Wallet' },
  },
  {
    path: 'touring',
    loadChildren: () => import('./features/touring/touring.module').then(m => m.TouringModule),
  },

  // Fallback route
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

// Export the preloading strategy for use in app.config.ts
export const routingProviders = [SelectivePreloadingStrategy];
