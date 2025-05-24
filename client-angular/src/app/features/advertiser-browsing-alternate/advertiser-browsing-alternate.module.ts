import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Import PrimeNG modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TabViewModule } from 'primeng/tabview';
import { MenuModule } from 'primeng/menu';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { PanelModule } from 'primeng/panel';
import { RippleModule } from 'primeng/ripple';

import { AdvertiserBrowsingAlternateComponent } from './advertiser-browsing-alternate.component';
import { advertiserBrowsingAlternateRoutes } from './advertiser-browsing-alternate.routes';

// Import child components
import { AltPremiumAdsSectionComponent } from './components/alt-premium-ads-section/alt-premium-ads-section.component';
import { AltNetflixViewComponent } from './components/alt-netflix-view/alt-netflix-view.component';
import { AltTinderViewComponent } from './components/alt-tinder-view/alt-tinder-view.component';
import { AltPaidPlacementSidebarComponent } from './components/alt-paid-placement-sidebar/alt-paid-placement-sidebar.component';
import { AltChatWidgetComponent } from './components/alt-chat-widget/alt-chat-widget.component';

@NgModule({
  declarations: [AdvertiserBrowsingAlternateComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(advertiserBrowsingAlternateRoutes),
    FormsModule,
    // PrimeNG modules
    CardModule,
    ButtonModule,
    ToolbarModule,
    InputTextModule,
    TabViewModule,
    MenuModule,
    TieredMenuModule,
    ProgressSpinnerModule,
    BadgeModule,
    TooltipModule,
    PanelModule,
    RippleModule,
    // Standalone child components
    AltPremiumAdsSectionComponent,
    AltNetflixViewComponent,
    AltTinderViewComponent,
    AltPaidPlacementSidebarComponent,
    AltChatWidgetComponent,
  ],
})
export class AdvertiserBrowsingAlternateModule {}
