// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for ad-management.module settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import {
  NbTabsetModule,
  NbButtonModule,
  NbIconModule,
  NbFormFieldModule,
  NbInputModule,
  NbSelectModule,
  NbCheckboxModule,
  NbDatepickerModule,
  NbToastrModule,
  NbSpinnerModule,
  NbCardModule,
  NbToggleModule,
  NbAutocompleteModule,
  NbRadioModule,
  NbAccordionModule,
  NbTagModule,
  NbTreeGridModule,
  NbUserModule,
  NbBadgeModule,
} from '@nebular/theme';
import { SharedModule } from '../../shared/shared.module';
import { AdManagementComponent } from './ad-management.component';
import { AdFormComponent } from './ad-form/ad-form.component';
import { AdListComponent } from './ad-list/ad-list.component';
import { AdStatsComponent } from './ad-stats/ad-stats.component';
import { TravelItineraryComponent } from './travel-itinerary/travel-itinerary.component';
import { NbPaginatorModule, NbSortModule } from '../../shared/components/custom-nebular-components';

const routes: Routes = [
  {
    path: '',
    component: AdManagementComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: AdListComponent },
      { path: 'create', component: AdFormComponent },
      { path: 'edit/:id', component: AdFormComponent },
      { path: 'stats', component: AdStatsComponent },
      { path: 'travel', component: TravelItineraryComponent },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NbTabsetModule,
    NbButtonModule,
    NbIconModule,
    NbFormFieldModule,
    NbInputModule,
    NbSelectModule,
    NbCheckboxModule,
    NbDatepickerModule,
    NbToastrModule,
    NbSpinnerModule,
    NbCardModule,
    NbToggleModule,
    NbAutocompleteModule,
    NbRadioModule,
    NbAccordionModule,
    NbTagModule,
    NbTreeGridModule,
    NbUserModule,
    NbBadgeModule,
    SharedModule,
    NbPaginatorModule,
    NbSortModule,
    AdFormComponent,
    AdListComponent,
    AdManagementComponent,
    AdStatsComponent,
    TravelItineraryComponent,
  ],
  exports: [],
})
export class AdManagementModule {}
