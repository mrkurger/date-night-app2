import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NetflixViewComponent } from './components/netflix-view/netflix-view.component';
import { TinderViewComponent } from './components/tinder-view/tinder-view.component';
import { FavoriteButtonComponent } from './components/favorites/favorite-button.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        children: [
          {
            path: 'browse',
            loadComponent: () =>
              import('./pages/browse/browse.component').then(m => m.BrowseComponent),
          },
          {
            path: 'favorites',
            loadComponent: () =>
              import('./pages/favorites/favorites.component').then(m => m.FavoritesComponent),
          },
          {
            path: 'rankings',
            loadComponent: () =>
              import('./pages/rankings/rankings.component').then(m => m.RankingsComponent),
          },
          {
            path: 'advertiser/:id',
            loadComponent: () =>
              import('./pages/advertiser/advertiser.component').then(m => m.AdvertiserComponent),
          },
          {
            path: '',
            redirectTo: 'browse',
            pathMatch: 'full',
          },
        ],
      },
    ]),
    NetflixViewComponent,
    TinderViewComponent,
    FavoriteButtonComponent,
  ],
  exports: [NetflixViewComponent, TinderViewComponent, FavoriteButtonComponent],
})
export class AdvertiserBrowsingModule {}
