import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbMenuModule,
  NbInputModule,
  NbFormFieldModule,
  NbSpinnerModule,
  NbToggleModule,
  NbTooltipModule,
  NbDialogModule,
  NbSelectModule,
  NbTagModule,
  NbCheckboxModule,
} from '@nebular/theme';
import { FavoriteButtonComponent } from './client-angular/src/app/shared/components/favorite-button/favorite-button.component.ts';
import { Component } from '@angular/core';

@Component({
  selector: 'app-favorites-list',
  templateUrl: './favorites-list.component.html',
  styleUrls: ['./favorites-list.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbMenuModule,
    NbInputModule,
    NbFormFieldModule,
    NbSpinnerModule,
    NbToggleModule,
    NbTooltipModule,
    NbDialogModule,
    NbSelectModule,
    NbTagModule,
    NbCheckboxModule,
    FavoriteButtonComponent,
  ],
})
export class FavoritesListComponent {
  // ... existing code ...
}
