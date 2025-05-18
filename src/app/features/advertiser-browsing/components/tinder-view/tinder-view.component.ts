import { Component, Input, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Advertiser } from '../../models/advertiser.interface';
import { FavoriteButtonComponent } from '../favorites/favorite-button.component';

@Component({
  selector: 'app-tinder-view',
  standalone: true,
  imports: [CommonModule, RouterModule, FavoriteButtonComponent],
  template: `
    <div class="relative h-[calc(100vh-200px)] flex items-center justify-center">
      <div *ngIf="advertisers.length === 0" class="text-center">
        <h3 class="text-xl mb-2">No more profiles</h3>
        <p class="text-gray-400">Check back later for new profiles</p>
      </div>

      <div
        *ngFor="let advertiser of visibleAdvertisers; let i = index"
        class="absolute w-full max-w-sm"
        [style.transform]="getCardStyle(i)"
        [style.z-index]="advertisers.length - i"
        [style.transition]="getDragTransition(i)"
        #card
      >
        <div
          class="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-900 border border-gray-800"
        >
          <img
            [src]="advertiser.image || '/placeholder.svg'"
            [alt]="advertiser.name"
            class="absolute inset-0 w-full h-full object-cover"
          />

          <!-- Overlay gradient -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
          ></div>

          <!-- Top actions -->
          <div class="absolute top-4 right-4">
            <app-favorite-button [advertiserId]="advertiser.id"></app-favorite-button>
          </div>

          <!-- Status badges -->
          <div class="absolute top-4 left-4 flex flex-col gap-2">
            <span
              *ngIf="advertiser.isOnline"
              class="inline-flex items-center rounded-full border border-green-500 bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-400"
            >
              Online Now
            </span>
            <span
              *ngIf="advertiser.isVip"
              class="inline-flex items-center rounded-full border border-amber-500 bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-400"
            >
              VIP
            </span>
          </div>

          <!-- Profile info -->
          <div class="absolute bottom-0 left-0 right-0 p-6">
            <div class="flex items-baseline gap-2 mb-2">
              <h3 class="text-2xl font-bold text-white">{{ advertiser.name }}</h3>
              <span class="text-xl text-white/90">{{ advertiser.age }}</span>
              <div class="flex items-center ml-auto">
                <svg
                  class="w-5 h-5 text-yellow-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <polygon
                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                  ></polygon>
                </svg>
                <span class="ml-1 text-lg text-white/90">{{ advertiser.rating }}</span>
              </div>
            </div>
            <p class="text-white/80 text-lg mb-3">{{ advertiser.location }}</p>
            <p class="text-white/70">{{ advertiser.description }}</p>
            <div class="flex flex-wrap gap-2 mt-4">
              <span
                *ngFor="let tag of advertiser.tags"
                class="text-sm text-white/60 bg-white/10 px-3 py-1 rounded-full"
              >
                #{{ tag }}
              </span>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
          <button
            (click)="handleSwipe('left', i)"
            class="w-14 h-14 flex items-center justify-center rounded-full bg-white/10 hover:bg-red-500/80 text-white/80 hover:text-white transition-colors"
          >
            <svg
              class="w-8 h-8"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <button
            (click)="handleSwipe('right', i)"
            class="w-14 h-14 flex items-center justify-center rounded-full bg-white/10 hover:bg-green-500/80 text-white/80 hover:text-white transition-colors"
          >
            <svg
              class="w-8 h-8"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class TinderViewComponent implements OnInit {
  @Input() advertisers: Advertiser[] = [];
  @ViewChild('card') cardElement!: ElementRef;

  visibleAdvertisers: Advertiser[] = [];
  currentIndex = 0;
  isDragging = false;
  startX = 0;
  currentX = 0;

  ngOnInit() {
    this.visibleAdvertisers = this.advertisers.slice(0, 3);
  }

  getCardStyle(index: number): string {
    if (index === 0 && this.isDragging) {
      const rotate = this.currentX * 0.1;
      const translateX = this.currentX;
      return `translate(${translateX}px) rotate(${rotate}deg)`;
    }
    return 'translate(0px) rotate(0deg)';
  }

  getDragTransition(index: number): string {
    return this.isDragging ? 'none' : 'transform 0.3s ease';
  }

  handleSwipe(direction: 'left' | 'right', index: number) {
    const translateX = direction === 'left' ? -1000 : 1000;
    const rotate = direction === 'left' ? -30 : 30;

    // Animate the card off screen
    if (this.cardElement) {
      const element = this.cardElement.nativeElement;
      element.style.transition = 'transform 0.5s ease';
      element.style.transform = `translate(${translateX}px) rotate(${rotate}deg)`;
    }

    // Update the visible cards after animation
    setTimeout(() => {
      this.currentIndex++;
      this.visibleAdvertisers = this.advertisers.slice(this.currentIndex, this.currentIndex + 3);
    }, 500);
  }

  // Touch and mouse event handlers would go here
  // These would handle the dragging functionality
  // For brevity, they're not included but would use standard DOM touch/mouse events
}
