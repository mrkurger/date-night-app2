import { Component, Input, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Advertiser } from '../../models/advertiser.interface';
import { FavoriteButtonComponent } from '../favorites/favorite-button.component';

@Component({
  selector: 'app-netflix-view',
  standalone: true,
  imports: [CommonModule, RouterModule, FavoriteButtonComponent],
  template: `
    <div *ngIf="advertisers.length === 0" class="text-center py-12">
      <h3 class="text-xl mb-2">No advertisers found</h3>
      <p class="text-gray-400">Try adjusting your search or filters</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        *ngFor="let advertiser of advertisers; let last = last; let i = index"
        [attr.ref]="last ? lastCardRef : null"
      >
        <a [routerLink]="['/advertiser', advertiser.id]">
          <div
            class="overflow-hidden bg-gray-900 border-gray-800 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20 h-full rounded-lg border"
            (mouseenter)="hoveredCard = advertiser.id"
            (mouseleave)="hoveredCard = null"
          >
            <div class="relative aspect-[3/4] overflow-hidden">
              <img
                [src]="advertiser.image || '/placeholder.svg'"
                [alt]="advertiser.name"
                class="object-cover w-full h-full transition-transform duration-500 ease-in-out hover:scale-105"
              />

              <div class="absolute top-2 right-2 flex flex-col gap-2">
                <app-favorite-button [advertiserId]="advertiser.id"></app-favorite-button>
              </div>

              <div *ngIf="advertiser.isOnline" class="absolute bottom-2 left-2">
                <span
                  class="inline-flex items-center rounded-full border border-green-500 bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-400"
                >
                  Online Now
                </span>
              </div>

              <div *ngIf="advertiser.isVip" class="absolute bottom-2 right-2">
                <span
                  class="inline-flex items-center rounded-full border border-amber-500 bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-400"
                >
                  VIP Content
                </span>
              </div>

              <!-- Hover Overlay -->
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 flex flex-col justify-end transition-opacity duration-300"
                [class.opacity-100]="hoveredCard === advertiser.id"
                [class.opacity-0]="hoveredCard !== advertiser.id"
              >
                <div class="flex gap-2 mb-2">
                  <button
                    class="flex-1 inline-flex items-center justify-center rounded-md bg-pink-600 px-3 py-2 text-sm font-medium text-white hover:bg-pink-700"
                  >
                    <svg
                      class="mr-1 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path
                        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                      ></path>
                    </svg>
                    Chat
                  </button>
                  <button
                    class="flex-1 inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <svg
                      class="mr-1 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polygon points="23 7 16 12 23 17 23 7"></polygon>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                    Video
                  </button>
                  <button
                    class="flex-1 inline-flex items-center justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    <svg
                      class="mr-1 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    Tip
                  </button>
                </div>
                <div class="text-xs text-gray-300">
                  <span *ngFor="let tag of advertiser.tags" class="mr-2"> #{{ tag }} </span>
                </div>
              </div>
            </div>

            <div class="p-4">
              <div class="flex justify-between items-start mb-1">
                <h3 class="text-lg font-semibold">{{ advertiser.name }}, {{ advertiser.age }}</h3>
                <div class="flex items-center">
                  <svg
                    class="h-4 w-4 text-yellow-500 mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <polygon
                      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                    ></polygon>
                  </svg>
                  <span class="text-sm">{{ advertiser.rating }}</span>
                </div>
              </div>
              <p class="text-sm text-gray-400 mb-2">{{ advertiser.location }}</p>
              <p class="text-sm line-clamp-2">{{ advertiser.description }}</p>
            </div>
          </div>
        </a>
      </div>
    </div>

    <div *ngIf="loading" class="col-span-full text-center py-4">
      <p>Loading more advertisers...</p>
    </div>
  `,
  styles: [],
})
export class NetflixViewComponent implements OnInit, OnDestroy {
  @Input() advertisers: Advertiser[] = [];
  @Input() loadMore?: (page: number) => void;
  @ViewChild('lastCardRef') lastCardRef!: ElementRef;

  hoveredCard: number | null = null;
  page = 1;
  loading = false;
  private observer: IntersectionObserver | null = null;

  ngOnInit() {
    if (this.loadMore) {
      this.setupIntersectionObserver();
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '20px',
      threshold: 0.1,
    };

    this.observer = new IntersectionObserver(entries => {
      const [entry] = entries;
      if (entry.isIntersecting && !this.loading && this.loadMore) {
        this.loading = true;
        this.loadMore(this.page);
        this.page++;
        this.loading = false;
      }
    }, options);

    if (this.lastCardRef?.nativeElement) {
      this.observer.observe(this.lastCardRef.nativeElement);
    }
  }
}
