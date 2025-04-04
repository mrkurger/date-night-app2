import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/ad-browser', pathMatch: 'full' },
  {
    path: 'ad-browser',
    loadChildren: () => import('./features/ad-browser/ad-browser.module').then(m => m.AdBrowserModule)
  },
  {
    path: 'ad-details/:adId',
    loadChildren: () => import('./features/ad-details/ad-details.module').then(m => m.AdDetailsModule)
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
    path: 'chat',
    loadChildren: () => import('./features/chat/chat.module').then(m => m.ChatModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'gallery',
    loadChildren: () => import('./features/gallery/gallery.module').then(m => m.GalleryModule)
  },
  {
    path: 'tinder',
    loadChildren: () => import('./features/tinder/tinder.module').then(m => m.TinderModule)
  },
  {
    path: 'my-ads',
    loadChildren: () => import('./features/ad-management/ad-management.module').then(m => m.AdManagementModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'ad-management',
    loadChildren: () => import('./features/ad-management/ad-management.module').then(m => m.AdManagementModule),
    canActivate: [AuthGuard]
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
  { path: '**', redirectTo: '/ad-browser' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
