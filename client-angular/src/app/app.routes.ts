import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/browse/browse.component').then(m => m.BrowseComponent)
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
    loadComponent: () => import('./features/gallery/gallery.component').then(m => m.GalleryComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'tinder',
    loadComponent: () => import('./features/tinder/tinder.component').then(m => m.TinderComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'netflix-view',
    loadComponent: () => import('./features/netflix-view/netflix-view.component').then(m => m.NetflixViewComponent)
  },
  {
    path: 'list-view',
    loadComponent: () => import('./features/list-view/list-view.component').then(m => m.ListViewComponent)
  },
  {
    path: 'payment',
    loadChildren: () => import('./features/payment/payment.module').then(m => m.PaymentModule),
    canActivate: [AuthGuard]
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
