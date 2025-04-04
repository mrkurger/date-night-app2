import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdService } from '../../../../core/services/ad.service';
import { Ad } from '../../../../core/models/ad.interface';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-ad-detail',
  template: `
    <div class="container mt-4" *ngIf="ad">
      <div class="row">
        <div class="col-md-8 offset-md-2">
          <div class="card">
            <div id="adCarousel" class="carousel slide" data-ride="carousel">
              <div class="carousel-inner">
                <div *ngFor="let image of ad.images; let i = index" class="carousel-item" [class.active]="i === 0">
                  <img [src]="image" class="d-block w-100" alt="Ad Image">
                </div>
              </div>
              <a class="carousel-control-prev" href="#adCarousel" role="button" data-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="sr-only">Previous</span>
              </a>
              <a class="carousel-control-next" href="#adCarousel" role="button" data-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="sr-only">Next</span>
              </a>
            </div>
            <div class="card-body">
              <h5 class="card-title">{{ad.title}}</h5>
              <p class="card-text">{{ad.description}}</p>
              <p class="card-text">Price: {{ad.price}}</p>
              <p class="card-text" *ngIf="userDetails">
                Contact: {{userDetails.displayName}} ({{userDetails.email}})
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdDetailComponent implements OnInit {
  ad: Ad | null = null;
  userDetails: any | null = null; // Replace 'any' with a specific interface
  
  constructor(
    private route: ActivatedRoute,
    private adService: AdService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadAdDetails();
  }

  loadAdDetails(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.adService.getAdDetails(id).subscribe({
        next: (ad) => {
          this.ad = ad;
          this.loadUserDetails(ad.userId);
        },
        error: (err) => console.error('Error fetching ad details:', err)
      });
    }
  }

  loadUserDetails(userId: string): void {
    this.userService.getPublicProfile(userId).subscribe({
      next: (user) => this.userDetails = user,
      error: (err) => console.error('Error fetching user details:', err)
    });
  }
}