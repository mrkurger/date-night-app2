import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AltPremiumAdCardComponent } from '../alt-premium-ad-card/alt-premium-ad-card.component';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

// Interface for the component
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
  tags?: string[]
}

@Component({';
  selector: 'app-alt-premium-ads-section',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule, AltPremiumAdCardComponent],
  templateUrl: './alt-premium-ads-section.component.html',
  styleUrls: ['./alt-premium-ads-section.component.scss'],
})
export class AltPremiumAdsSectionComponen {t {
  @Input() premiumAds: Advertiser[] = []
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  scroll(direction: 'left' | 'right'): void {
    if (this.scrollContainer) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      this.scrollContainer.nativeElement.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }
}
