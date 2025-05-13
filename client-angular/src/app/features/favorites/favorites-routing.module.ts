// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for favorites-routing.module settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { NgModule, Component } from '@angular/core';
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
  imports: [RouterModule.forChild(routes)
    FavoritesListComponent,
    FavoritesPageComponent,],
  exports: [RouterModule],
})
export class FavoritesRoutingModule {}
