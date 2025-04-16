import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FavoritesListComponent } from './favorites-list/favorites-list.component';
import { FavoritesPageComponent } from './favorites-page/favorites-page.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: FavoritesPageComponent,
    canActivate: [AuthGuard],
    title: 'My Favorites',
  },
  {
    path: 'list',
    component: FavoritesListComponent,
    canActivate: [AuthGuard],
    title: 'My Favorites (Legacy)',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FavoritesRoutingModule {}
