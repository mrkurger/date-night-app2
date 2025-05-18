import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NetflixViewComponent } from '../../components/netflix-view/netflix-view.component';
import { TinderViewComponent } from '../../components/tinder-view/tinder-view.component';
import { Advertiser } from '../../models/advertiser.interface';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [CommonModule, RouterModule, NetflixViewComponent, TinderViewComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- View Toggle -->
      <div class="flex justify-center mb-8">
        <div class="inline-flex rounded-lg border border-gray-800 p-1 bg-gray-900">
          <button
            *ngFor="let view of viewOptions"
            (click)="activeView = view.value"
            [class.bg-pink-600]="activeView === view.value"
            [class.text-white]="activeView === view.value"
            [class.text-gray-400]="activeView !== view.value"
            class="px-4 py-2 rounded-md transition-colors duration-200 hover:text-white"
          >
            {{ view.label }}
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="max-w-2xl mx-auto mb-8">
        <div class="relative">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearch($event)"
            placeholder="Search advertisers..."
            class="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
          />
          <button
            *ngIf="searchQuery"
            (click)="clearSearch()"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

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
          (click)="loadAdvertisers()"
          class="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          Try Again
        </button>
      </div>

      <!-- Content -->
      <ng-container *ngIf="!loading && !error">
        <app-netflix-view
          *ngIf="activeView === 'grid'"
          [advertisers]="filteredAdvertisers"
          [loadMore]="loadMore"
        ></app-netflix-view>

        <app-tinder-view
          *ngIf="activeView === 'cards'"
          [advertisers]="filteredAdvertisers"
        ></app-tinder-view>
      </ng-container>
    </div>
  `,
  styles: [],
})
export class BrowseComponent implements OnInit {
  viewOptions = [
    { label: 'Grid View', value: 'grid' },
    { label: 'Cards View', value: 'cards' },
  ];
  activeView: 'grid' | 'cards' = 'grid';
  advertisers: Advertiser[] = [];
  filteredAdvertisers: Advertiser[] = [];
  loading = true;
  error: string | null = null;
  searchQuery = '';
  page = 1;

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
    // Add more mock data as needed
  ];

  ngOnInit() {
    this.loadAdvertisers();
  }

  loadAdvertisers() {
    // Simulate API call
    this.loading = true;
    this.error = null;

    setTimeout(() => {
      try {
        this.advertisers = this.mockAdvertisers;
        this.filteredAdvertisers = this.advertisers;
        this.loading = false;
      } catch (err) {
        this.error = 'Failed to load advertisers';
        this.loading = false;
      }
    }, 1000);
  }

  onSearch(query: string) {
    if (!query.trim()) {
      this.filteredAdvertisers = this.advertisers;
      return;
    }

    const searchTerm = query.toLowerCase();
    this.filteredAdvertisers = this.advertisers.filter(
      advertiser =>
        advertiser.name.toLowerCase().includes(searchTerm) ||
        advertiser.location.toLowerCase().includes(searchTerm) ||
        advertiser.description.toLowerCase().includes(searchTerm) ||
        advertiser.tags.some(tag => tag.toLowerCase().includes(searchTerm)),
    );
  }

  clearSearch() {
    this.searchQuery = '';
    this.filteredAdvertisers = this.advertisers;
  }

  loadMore = (page: number) => {
    // Implement pagination logic here
    console.log('Loading page:', page);
  };
}
