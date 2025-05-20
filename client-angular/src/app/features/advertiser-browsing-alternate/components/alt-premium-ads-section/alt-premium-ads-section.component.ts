import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // For View All link
import { NebularModule } from '../../../../../app/shared/nebular.module';
import { NbCardModule, NbButtonModule, NbIconModule } from '@nebular/theme';
import { AltPremiumAdCardComponent } from '../alt-premium-ad-card/alt-premium-ad-card.component'; // Import the new card component

// Assuming Advertiser interface is accessible or defined here/imported
interface Advertiser {
  id: number | string;
  name: string;
  image?: string;
  isPremium?: boolean;
  location?: string;
  description?: string;
  age?: number;
  rating?: number;
  isVip?: boolean;
  isOnline?: boolean;
  tags?: string[];
}

@Component({
    selector: 'app-alt-premium-ads-section',
    imports: [NebularModule, CommonModule,
        RouterModule,
        NbCardModule,
        NbButtonModule,
        NbIconModule,
        AltPremiumAdCardComponent, // Add to imports
    ],
    templateUrl: './alt-premium-ads-section.component.html',
    styleUrls: ['./alt-premium-ads-section.component.scss']
})
export class AltPremiumAdsSectionComponent {
  @Input() premiumAds: Advertiser[] = [];
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  scroll(direction: 'left' | 'right'): void {
    if (this.scrollContainer) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      this.scrollContainer.nativeElement.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }
}
