import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoritesRoutingModule } from './favorites-routing.module';
import { FavoritesListComponent } from './favorites-list/favorites-list.component';
import { FavoritesPageComponent } from './favorites-page/favorites-page.component';

@NgModule({
  declarations: [],
  imports: [CommonModule, FavoritesRoutingModule, FavoritesListComponent, FavoritesPageComponent],
})
export class FavoritesModule {}
