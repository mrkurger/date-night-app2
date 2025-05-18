import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NebularModule } from '../../../../../app/shared/nebular.module';
import {
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbBadgeModule,
  NbTagModule,
} from '@nebular/theme';
// Re-use Advertiser interface if it's defined globally for this feature, or define locally
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
  imports: [NebularModule, CommonModule, NbCardModule, NbButtonModule, NbIconModule, NbBadgeModule, NbTagModule],
  templateUrl: './alt-premium-ad-card.component.html',
  styleUrls: ['./alt-premium-ad-card.component.scss'],
})
export class AltPremiumAdCardComponent {
  @Input() ad!: Advertiser;
  isHovered = false;
  // TODO: Implement FavoriteButton logic or integrate existing Angular FavoriteButtonComponent
}
