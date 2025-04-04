import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatBadgeModule } from '@angular/material/badge';

import { SharedModule } from '../../shared/shared.module';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

import { AdManagementComponent } from './ad-management.component';
import { AdFormComponent } from './ad-form/ad-form.component';
import { AdListComponent } from './ad-list/ad-list.component';
import { AdStatsComponent } from './ad-stats/ad-stats.component';
import { TravelItineraryComponent } from './travel-itinerary/travel-itinerary.component';

const routes: Routes = [
  {
    path: '',
    component: AdManagementComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['advertiser', 'admin'] },
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: AdListComponent },
      { path: 'create', component: AdFormComponent },
      { path: 'edit/:id', component: AdFormComponent },
      { path: 'stats/:id', component: AdStatsComponent },
      { path: 'travel/:id', component: TravelItineraryComponent }
    ]
  }
];

@NgModule({
  declarations: [
    AdManagementComponent,
    AdFormComponent,
    AdListComponent,
    AdStatsComponent,
    TravelItineraryComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatBadgeModule
  ]
})
export class AdManagementModule { }