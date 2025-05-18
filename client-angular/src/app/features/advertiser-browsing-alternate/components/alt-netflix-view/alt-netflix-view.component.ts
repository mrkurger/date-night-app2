import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbBadgeModule,
  NbSpinnerModule,
  NbTagModule,
} from '@nebular/theme';

interface Advertiser {
  id: number | string;
  name: string;
  age?: number;
  location?: string;
  description?: string;
  tags?: string[];
  image?: string;
  isPremium?: boolean;
  isOnline?: boolean;
  isFavorite?: boolean;
}

@Component({
  selector: 'app-alt-netflix-view',
  standalone: true,
  imports: [
    CommonModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbBadgeModule,
    NbSpinnerModule,
    NbTagModule,
  ],
  templateUrl: './alt-netflix-view.component.html',
  styleUrls: ['./alt-netflix-view.component.scss'],
})
export class AltNetflixViewComponent {
  @Input() advertisers: Advertiser[] = [];
  @Input() loading = false;

  @Output() favorite = new EventEmitter<Advertiser>();
  @Output() chat = new EventEmitter<Advertiser>();
  @Output() viewProfile = new EventEmitter<Advertiser>();

  hoveredCardId: number | string | null = null;

  onCardHover(id: number | string, isHovered: boolean): void {
    this.hoveredCardId = isHovered ? id : null;
  }

  onFavorite(advertiser: Advertiser): void {
    this.favorite.emit(advertiser);
  }

  onChat(advertiser: Advertiser): void {
    this.chat.emit(advertiser);
  }

  onViewProfile(advertiser: Advertiser): void {
    this.viewProfile.emit(advertiser);
  }
}
