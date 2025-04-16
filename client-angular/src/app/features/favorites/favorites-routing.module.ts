import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FavoritesListComponent } from './favorites-list/favorites-list.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: FavoritesListComponent,
    canActivate: [AuthGuard],
    title: 'My Favorites',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FavoritesRoutingModule {}
