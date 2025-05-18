import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import {
  NbCardModule,
  NbLayoutModule,
  NbButtonModule,
  NbIconModule,
  NbFormFieldModule,
  NbInputModule,
  NbTabsetModule,
  NbSpinnerModule,
  NbBadgeModule,
} from '@nebular/theme'; // Added missing Nebular modules
import { AdvertiserBrowsingAlternateComponent } from './advertiser-browsing-alternate.component';
import { advertiserBrowsingAlternateRoutes } from './advertiser-browsing-alternate.routes';

// Import new child components
import { AltPremiumAdsSectionComponent } from './components/alt-premium-ads-section/alt-premium-ads-section.component';
import { AltNetflixViewComponent } from './components/alt-netflix-view/alt-netflix-view.component';
import { AltTinderViewComponent } from './components/alt-tinder-view/alt-tinder-view.component';
import { AltPaidPlacementSidebarComponent } from './components/alt-paid-placement-sidebar/alt-paid-placement-sidebar.component';
import { AltChatWidgetComponent } from './components/alt-chat-widget/alt-chat-widget.component';
// TODO: Import AltPaidPlacementSidebarComponent and AltChatWidgetComponent when created

@NgModule({
  declarations: [AdvertiserBrowsingAlternateComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(advertiserBrowsingAlternateRoutes),
    FormsModule, // Add FormsModule here
    NbCardModule,
    NbLayoutModule,
    NbButtonModule,
    NbIconModule,
    NbFormFieldModule, // For search input
    NbInputModule, // For search input
    NbTabsetModule, // For view tabs
    NbSpinnerModule, // For loading states
    NbBadgeModule, // For badges (e.g. on filter button)
    // Import standalone child components here
    AltPremiumAdsSectionComponent,
    AltNetflixViewComponent,
    AltTinderViewComponent,
    AltPaidPlacementSidebarComponent,
    AltChatWidgetComponent,
    // TODO: Add AltPaidPlacementSidebarComponent and AltChatWidgetComponent to imports when created
  ],
})
export class AdvertiserBrowsingAlternateModule {}
