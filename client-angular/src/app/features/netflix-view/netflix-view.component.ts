import { Component, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdService } from '../../core/services/ad.service';
import { NotificationService } from '../../core/services/notification.service';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { Ad } from '../../core/models/ad.model';

@Component({
  selector: 'app-netflix-view',
  templateUrl: './netflix-view.component.html',
  styleUrls: ['./netflix-view.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule]
})
export class NetflixViewComponent implements OnInit, AfterViewInit {
  @ViewChildren('rowContainer') rowContainers!: QueryList<ElementRef>;
  
  categories: string[] = ['Featured', 'New Arrivals', 'Most Popular', 'Nearby', 'Touring'];
  adsByCategory: { [key: string]: Ad[] } = {};
  loading = true;
  error: string | null = null;
  filterForm: FormGroup;
  isAuthenticated = false;
  
  // For hero section
  featuredAd: Ad | null = null;
  
  constructor(
    private adService: AdService,
    private notificationService: NotificationService,
    private chatService: ChatService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      category: [''],
      location: [''],
      touringOnly: [false]
    });
  }

  ngOnInit(): void {
    this.loadAds();
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }
  
  ngAfterViewInit(): void {
    // Initialize any carousel behaviors after view is initialized
  }
  
  loadAds(): void {
    this.loading = true;
    this.error = null;
    
    this.adService.getAds().subscribe({
      next: (ads) => {
        // Organize ads by category
        this.categories.forEach(category => {
          // For demo purposes, we're just randomly assigning ads to categories
          // In a real app, you would filter based on actual categories
          this.adsByCategory[category] = this.shuffleArray([...ads]).slice(0, 10);
        });
        
        // Set a featured ad for the hero section
        if (ads.length > 0) {
          this.featuredAd = ads[Math.floor(Math.random() * ads.length)];
        }
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load ads. Please try again.';
        this.loading = false;
        console.error('Error loading ads:', err);
      }
    });
  }
  
  // Helper method to shuffle array for demo purposes
  private shuffleArray(array: any[]): any[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
  
  scrollRow(category: string, direction: 'left' | 'right'): void {
    const rowIndex = this.categories.indexOf(category);
    if (rowIndex === -1) return;
    
    const container = this.rowContainers.toArray()[rowIndex].nativeElement;
    const scrollAmount = container.clientWidth * 0.8;
    const newScrollPosition = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;
    
    container.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth'
    });
  }
  
  viewAdDetails(adId: string): void {
    // Navigate to ad details page
    window.location.href = `/ad-details/${adId}`;
  }
  
  likeAd(adId: string, event?: Event): void {
    if (event) event.stopPropagation();
    
    if (!this.isAuthenticated) {
      this.notificationService.error('Please log in to like ads');
      return;
    }
    
    this.adService.likeAd(adId).subscribe({
      next: () => {
        this.notificationService.success('Added to your favorites');
      },
      error: (err) => {
        this.notificationService.error('Failed to like ad');
        console.error('Error liking ad:', err);
      }
    });
  }
  
  startChat(adId: string, event?: Event): void {
    if (event) event.stopPropagation();
    
    if (!this.isAuthenticated) {
      this.notificationService.error('Please log in to start a chat');
      return;
    }
    
    this.chatService.createRoom(adId).subscribe({
      next: (room) => {
        window.location.href = `/chat/${room._id}`;
      },
      error: (err) => {
        this.notificationService.error('Failed to start chat');
        console.error('Error starting chat:', err);
      }
    });
  }
  
  getMediaUrl(ad: Ad): string {
    if (ad.media && ad.media.length > 0) {
      return ad.media[0].url;
    }
    return '/assets/images/default-profile.jpg';
  }
  
  applyFilters(): void {
    // Apply filters logic
    this.loadAds();
  }
  
  openFilters(): void {
    // Open filters modal
    const modal = document.getElementById('filtersModal');
    if (modal) {
      // Using Bootstrap's modal API
      // @ts-ignore
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
    }
  }
}