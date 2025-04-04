import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

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
    canActivate: [AuthGuard]
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
    canActivate: [AuthGuard]
  },
  {
    path: 'chat',
    loadChildren: () => import('./features/chat/chat.module').then(m => m.ChatModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'gallery',
    loadChildren: () => import('./features/gallery/gallery.module').then(m => m.GalleryModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'tinder',
    loadChildren: () => import('./features/tinder/tinder.module').then(m => m.TinderModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'payment',
    loadChildren: () => import('./features/payment/payment.module').then(m => m.PaymentModule),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
