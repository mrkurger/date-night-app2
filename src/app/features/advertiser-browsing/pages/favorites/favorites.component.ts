import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NetflixViewComponent } from '../../components/netflix-view/netflix-view.component';
import { Advertiser } from '../../models/advertiser.interface';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, NetflixViewComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-center mb-8">Your Favorites</h1>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center items-center min-h-[400px]">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"
        ></div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && favorites.length === 0" class="text-center py-12">
        <h3 class="text-xl mb-2">No favorites yet</h3>
        <p class="text-gray-400 mb-4">Start browsing and add some favorites!</p>
        <a
          routerLink="/advertiser-browsing/browse"
          class="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          Browse Advertisers
        </a>
      </div>

      <!-- Content -->
      <ng-container *ngIf="!loading && favorites.length > 0">
        <app-netflix-view [advertisers]="favorites" [loadMore]="loadMore"></app-netflix-view>
      </ng-container>
    </div>
  `,
  styles: [],
})
export class FavoritesComponent implements OnInit {
  favorites: Advertiser[] = [];
  loading = true;

  // Mock data for demonstration
  mockFavorites: Advertiser[] = [
    {
      id: 1,
      name: 'Jasmine',
      age: 25,
      location: 'Stockholm, Sweden',
      description: 'Professional dancer with a passion for performance arts...',
      tags: ['dancer', 'performer'],
      image: '/placeholder.svg?text=Jasmine',
      rating: 4.8,
      isVip: true,
      onlineStatus: true, // Changed from isOnline
      views: 1200, // Added views
      duration: '45 min', // Added duration
      category: 'Trending Now', // Added category
    },
    // Add more mock data as needed
  ];

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    // Simulate API call
    this.loading = true;
    setTimeout(() => {
      this.favorites = this.mockFavorites;
      this.loading = false;
    }, 1000);
  }

  loadMore = (page: number) => {
    // Implement pagination logic here
    console.log('Loading page:', page);
  };
}
