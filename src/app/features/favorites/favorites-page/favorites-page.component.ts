import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  NbFormFieldModule,
  NbInputModule,
  NbSelectModule,
  NbButtonModule,
  NbIconModule,
  NbTagModule,
  NbSpinnerModule,
  NbTabsetModule,
  NbCardModule,
  NbMenuModule,
  NbCheckboxModule,
  NbToggleModule,
  NbTooltipModule,
  NbToastrModule,
  NbDialogModule,
  NbDatepickerModule,
  NbContextMenuModule,
  NbActionsModule,
  NbListModule,
  NbAccordionModule,
  NbPopoverModule,
  NbProgressBarModule,
  NbAlertModule,
  NbBadgeModule,
  NbLayoutModule,
  NbSidebarModule,
  NbUserModule,
  NbSearchModule,
  NbWindowModule,
  NbStepperModule,
  NbTreeGridModule,
  NbTableModule,
} from '@nebular/theme';
import { FavoriteButtonComponent } from '../../../shared/components/favorite-button/favorite-button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Component } from '@angular/core';

@Component({
  selector: 'app-favorites-page',
  templateUrl: './favorites-page.component.html',
  styleUrls: ['./favorites-page.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NbFormFieldModule,
    NbInputModule,
    NbSelectModule,
    NbButtonModule,
    NbIconModule,
    NbTagModule,
    NbSpinnerModule,
    NbTabsetModule,
    NbCardModule,
    NbMenuModule,
    NbCheckboxModule,
    NbToggleModule,
    NbTooltipModule,
    NbToastrModule,
    NbDialogModule,
    NbDatepickerModule,
    NbContextMenuModule,
    NbActionsModule,
    NbListModule,
    NbAccordionModule,
    NbPopoverModule,
    NbProgressBarModule,
    NbAlertModule,
    NbBadgeModule,
    NbLayoutModule,
    NbSidebarModule,
    NbUserModule,
    NbSearchModule,
    NbWindowModule,
    NbStepperModule,
    NbTreeGridModule,
    NbTableModule,
    FavoriteButtonComponent,
    LoadingSpinnerComponent,
  ],
})
export class FavoritesPageComponent {
  // ... existing code ...
}
