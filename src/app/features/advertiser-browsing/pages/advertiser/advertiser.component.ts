import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Advertiser } from '../../models/advertiser.interface';
import { FavoriteButtonComponent } from '../../components/favorites/favorite-button.component';

@Component({
  selector: 'app-advertiser',
  standalone: true,
  imports: [CommonModule, RouterModule, FavoriteButtonComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center items-center min-h-[400px]">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"
        ></div>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="text-center text-red-500 py-8">
        {{ error }}
        <button
          (click)="loadAdvertiser()"
          class="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          Try Again
        </button>
      </div>

      <!-- Content -->
      <ng-container *ngIf="!loading && !error && advertiser">
        <div class="max-w-4xl mx-auto">
          <!-- Header Section -->
          <div class="relative rounded-xl overflow-hidden mb-8 aspect-video">
            <Image
              [src]="advertiser.image || '/placeholder.svg'"
              [alt]="advertiser.name"
              class="absolute inset-0 w-full h-full object-cover"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
            ></div>

            <!-- Profile Info Overlay -->
            <div class="absolute bottom-0 left-0 right-0 p-8">
              <div class="flex items-center justify-between">
                <div>
                  <h1 class="text-4xl font-bold text-white mb-2">
                    {{ advertiser.name }}, {{ advertiser.age }}
                  </h1>
                  <p class="text-xl text-white/80">{{ advertiser.location }}</p>
                </div>
                <div class="flex items-center gap-4">
                  <div class="flex items-center bg-black/50 rounded-full px-4 py-2">
                    <svg
                      class="w-6 h-6 text-yellow-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <polygon
                        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                      ></polygon>
                    </svg>
                    <span class="text-xl text-white">{{ advertiser.rating }}</span>
                  </div>
                  <app-favorite-button [advertiserId]="advertiser.id"></app-favorite-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Status Badges -->
          <div class="flex gap-4 mb-8">
            <span
              *ngIf="advertiser.onlineStatus" // Changed from isOnline to onlineStatus
              class="inline-flex items-center rounded-full border border-green-500 bg-green-500/20 px-4 py-2 text-sm font-medium text-green-400"
            >
              <span class="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Online Now
            </span>
            <span
              *ngIf="advertiser.isVip"
              class="inline-flex items-center rounded-full border border-amber-500 bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-400"
            >
              <svg
                class="w-5 h-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                ></path>
              </svg>
              VIP Member
            </span>
          </div>

          <!-- Description -->
          <div class="bg-gray-900 rounded-xl p-8 mb-8">
            <h2 class="text-2xl font-semibold mb-4">About Me</h2>
            <p class="text-gray-300 text-lg leading-relaxed">{{ advertiser.description }}</p>
          </div>

          <!-- Tags -->
          <div class="flex flex-wrap gap-2 mb-8">
            <span
              *ngFor="let tag of advertiser.tags"
              class="px-4 py-2 rounded-full bg-gray-800 text-gray-300 text-sm"
            >
              #{{ tag }}
            </span>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4">
            <button
              class="flex-1 bg-pink-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-pink-700 transition-colors"
            >
              <svg
                class="w-5 h-5 inline-block mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                ></path>
              </svg>
              Start Chat
            </button>
            <button
              class="flex-1 bg-blue-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-blue-700 transition-colors"
            >
              <svg
                class="w-5 h-5 inline-block mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
              Video Call
            </button>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [],
})
export class AdvertiserComponent implements OnInit {
  advertiser: Advertiser | null = null;
  loading = true;
  error: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadAdvertiser(id);
      }
    });
  }

  loadAdvertiser(id?: number) {
    // Simulate API call
    this.loading = true;
    this.error = null;

    setTimeout(() => {
      try {
        // Mock data
        this.advertiser = {
          id: 1,
          name: 'Jasmine',
          age: 25,
          location: 'Stockholm, Sweden',
          description:
            'Professional dancer with a passion for performance arts. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
          tags: ['dancer', 'performer', 'artist', 'professional'],
          image: '/placeholder.svg?text=Jasmine',
          rating: 4.8,
          isVip: true,
          onlineStatus: true, // Changed from isOnline to onlineStatus
        };
        this.loading = false;
      } catch (err) {
        this.error = 'Failed to load advertiser details';
        this.loading = false;
      }
    }, 1000);
  }
}
