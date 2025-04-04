import { Component, OnInit } from '@angular/core';
import { AdService } from '../../core/services/ad.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div *ngIf="loading" class="text-center">Loading...</div>
      <div *ngIf="error" class="alert alert-danger">{{error}}</div>
      
      <div class="row">
        <div *ngFor="let category of categories" class="col-md-4 mb-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">{{category.name}}</h5>
              <p class="card-text">{{category.description}}</p>
              <button (click)="loadAdsByCategory(category.id)" class="btn btn-primary">
                View Ads
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GalleryComponent implements OnInit {
  categories: any[] = [];
  loading = false;
  error = '';

  constructor(private adService: AdService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.adService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load categories';
        this.loading = false;
      }
    });
  }

  loadAdsByCategory(categoryId: string): void {
    // Implementation for loading ads by category
  }
}
