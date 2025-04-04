import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/ad-browser/ad-browser.module').then(m => m.AdBrowserModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [authGuard]
  },
  {
    path: 'ads',
    loadChildren: () => import('./features/ads/ads.module').then(m => m.AdsModule)
  },
  {
    path: 'ad-details/:id',
    loadChildren: () => import('./features/ad-details/ad-details.module').then(m => m.AdDetailsModule)
  },
  {
    path: 'ad-management',
    loadChildren: () => import('./features/ad-management/ad-management.module').then(m => m.AdManagementModule),
    canActivate: [authGuard]
  },
  {
    path: 'chat',
    loadChildren: () => import('./features/chat/chat.module').then(m => m.ChatModule),
    canActivate: [authGuard]
  },
  {
    path: 'gallery',
    loadComponent: () => import('./features/gallery/gallery.component').then(m => m.GalleryComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tinder',
    loadComponent: () => import('./features/tinder/tinder.component').then(m => m.TinderComponent),
    canActivate: [authGuard]
  },
  {
    path: 'payment',
    loadChildren: () => import('./features/payment/payment.module').then(m => m.PaymentModule),
    canActivate: [authGuard]
  },
  {
    path: 'touring',
    loadChildren: () => import('./features/touring/touring.module').then(m => m.TouringModule)
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
