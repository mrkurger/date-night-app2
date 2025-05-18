import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NetflixViewComponent } from '../../components/netflix-view/netflix-view.component';
import { Advertiser } from '../../models/advertiser.interface';

@Component({
  selector: 'app-rankings',
  standalone: true,
  imports: [CommonModule, RouterModule, NetflixViewComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-center mb-8">Top Advertisers</h1>

      <!-- Ranking Categories -->
      <div class="flex justify-center mb-8">
        <div class="inline-flex rounded-lg border border-gray-800 p-1 bg-gray-900">
          <button
            *ngFor="let category of categories"
            (click)="activeCategory = category.value"
            [class.bg-pink-600]="activeCategory === category.value"
            [class.text-white]="activeCategory === category.value"
            [class.text-gray-400]="activeCategory !== category.value"
            class="px-4 py-2 rounded-md transition-colors duration-200 hover:text-white"
          >
            {{ category.label }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center items-center min-h-[400px]">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"
        ></div>
      </div>

      <!-- Content -->
      <ng-container *ngIf="!loading">
        <div class="mb-8">
          <h2 class="text-2xl font-semibold mb-4">
            {{ getCategoryLabel() }}
          </h2>
          <app-netflix-view
            [advertisers]="rankedAdvertisers"
            [loadMore]="loadMore"
          ></app-netflix-view>
        </div>
      </ng-container>
    </div>
  `,
  styles: [],
})
export class RankingsComponent implements OnInit {
  categories = [
    { label: 'Top Rated', value: 'rating' },
    { label: 'Most Popular', value: 'popular' },
    { label: 'Most Reviewed', value: 'reviews' },
    { label: 'Newest', value: 'new' },
  ];
  activeCategory: string = 'rating';
  rankedAdvertisers: Advertiser[] = [];
  loading = true;

  // Mock data for demonstration
  mockAdvertisers: Advertiser[] = [
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
      isOnline: true,
    },
    {
      id: 2,
      name: 'Crystal',
      age: 27,
      location: 'Oslo, Norway',
      description: 'Certified massage therapist specializing in relaxation...',
      tags: ['massage', 'therapy'],
      image: '/placeholder.svg?text=Crystal',
      rating: 4.9,
      isVip: true,
      isOnline: true,
    },
  ];

  ngOnInit() {
    this.loadRankings();
  }

  loadRankings() {
    // Simulate API call
    this.loading = true;
    setTimeout(() => {
      this.rankedAdvertisers = this.mockAdvertisers;
      this.loading = false;
    }, 1000);
  }

  getCategoryLabel(): string {
    const category = this.categories.find(c => c.value === this.activeCategory);
    return category ? category.label : '';
  }

  loadMore = (page: number) => {
    // Implement pagination logic here
    console.log('Loading page:', page);
  };
}
