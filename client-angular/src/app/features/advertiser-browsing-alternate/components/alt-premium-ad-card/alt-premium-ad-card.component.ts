import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
interface Advertiser {
  id: number | string;
  name: string;
  age?: number;
  location?: string;
  description?: string;
  tags?: string[];
  image?: string;
  rating?: number;
  isVip?: boolean;
  isOnline?: boolean;
  isPremium?: boolean;
}

@Component({
  selector: 'app-alt-premium-ad-card',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule, BadgeModule, TagModule],
  templateUrl: './alt-premium-ad-card.component.html',
  styleUrls: ['./alt-premium-ad-card.component.scss'],
})
export class AltPremiumAdCardComponent {
  @Input() ad!: Advertiser;
  isHovered = false;
}
