import { 
  Component, 
  OnInit, 
  Input, 
  Output, 
  EventEmitter, 
  ElementRef, 
  ViewChild, 
  AfterViewInit, 
  OnDestroy 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Ad } from '../../core/models/ad.model';

@Component({
  selector: 'app-tinder-card',
  templateUrl: './tinder-card.component.html',
  styleUrls: ['./tinder-card.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class TinderCardComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() ad!: Ad;
  @Output() swiped = new EventEmitter<{ direction: 'left' | 'right', adId: string }>();
  @Output() viewDetails = new EventEmitter<string>();
  @Output() startChat = new EventEmitter<string>();
  
  @ViewChild('card') cardElement!: ElementRef;
  
  currentMediaIndex = 0;
  cardState: 'default' | 'swiping' | 'swiped-left' | 'swiped-right' = 'default';
  
  private hammerManager: HammerManager | null = null;
  private initialX = 0;
  private initialY = 0;
  private isDragging = false;
  
  constructor() {}
  
  ngOnInit(): void {}
  
  ngAfterViewInit(): void {
    this.initializeSwipeGesture();
  }
  
  ngOnDestroy(): void {
    if (this.hammerManager) {
      this.hammerManager.destroy();
    }
  }
  
  private initializeSwipeGesture(): void {
    // Check if Hammer is available (should be imported in angular.json)
    if (typeof Hammer !== 'undefined') {
      const hammer = new Hammer(this.cardElement.nativeElement);
      hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
      
      hammer.on('panstart', (event) => {
        this.isDragging = true;
        this.cardState = 'swiping';
        this.initialX = event.center.x;
        this.initialY = event.center.y;
      });
      
      hammer.on('panmove', (event) => {
        if (!this.isDragging) return;
        
        const card = this.cardElement.nativeElement;
        const deltaX = event.center.x - this.initialX;
        const deltaY = event.center.y - this.initialY;
        const rotation = deltaX * 0.1; // Rotate slightly based on drag distance
        
        card.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;
        
        // Show like/dislike indicators based on drag direction
        if (deltaX > 50) {
          this.showLikeIndicator();
        } else if (deltaX < -50) {
          this.showDislikeIndicator();
        } else {
          this.resetIndicators();
        }
      });
      
      hammer.on('panend', (event) => {
        if (!this.isDragging) return;
        this.isDragging = false;
        
        const deltaX = event.center.x - this.initialX;
        const threshold = 100; // Minimum distance to trigger a swipe
        
        if (deltaX > threshold) {
          this.onSwipe('right');
        } else if (deltaX < -threshold) {
          this.onSwipe('left');
        } else {
          this.resetCard();
        }
      });
      
      this.hammerManager = hammer;
    } else {
      // Fallback for when Hammer.js is not available
      console.warn('Hammer.js is not loaded. Swipe gestures will not work.');
      
      // Add basic mouse events as fallback
      const card = this.cardElement.nativeElement;
      
      const onMouseDown = (e: MouseEvent) => {
        this.isDragging = true;
        this.cardState = 'swiping';
        this.initialX = e.clientX;
        this.initialY = e.clientY;
      };
      
      const onMouseMove = (e: MouseEvent) => {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.initialX;
        const deltaY = e.clientY - this.initialY;
        const rotation = deltaX * 0.1;
        
        card.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;
        
        if (deltaX > 50) {
          this.showLikeIndicator();
        } else if (deltaX < -50) {
          this.showDislikeIndicator();
        } else {
          this.resetIndicators();
        }
      };
      
      const onMouseUp = (e: MouseEvent) => {
        if (!this.isDragging) return;
        this.isDragging = false;
        
        const deltaX = e.clientX - this.initialX;
        const threshold = 100;
        
        if (deltaX > threshold) {
          this.onSwipe('right');
        } else if (deltaX < -threshold) {
          this.onSwipe('left');
        } else {
          this.resetCard();
        }
      };
      
      card.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      
      // Clean up event listeners on destroy
      this.hammerManager = {
        destroy: () => {
          card.removeEventListener('mousedown', onMouseDown);
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        }
      } as any;
    }
  }
  
  onSwipe(direction: 'left' | 'right'): void {
    this.cardState = direction === 'left' ? 'swiped-left' : 'swiped-right';
    
    // Emit the swipe event after animation completes
    setTimeout(() => {
      this.swiped.emit({ direction, adId: this.ad._id });
    }, 300);
  }
  
  resetCard(): void {
    const card = this.cardElement.nativeElement;
    card.style.transform = '';
    this.cardState = 'default';
    this.resetIndicators();
  }
  
  showLikeIndicator(): void {
    const likeIndicator = this.cardElement.nativeElement.querySelector('.like-indicator');
    const dislikeIndicator = this.cardElement.nativeElement.querySelector('.dislike-indicator');
    
    if (likeIndicator && dislikeIndicator) {
      likeIndicator.style.opacity = '1';
      likeIndicator.style.transform = 'translateY(-50%) rotate(20deg) scale(1)';
      dislikeIndicator.style.opacity = '0';
      dislikeIndicator.style.transform = 'translateY(-50%) rotate(-20deg) scale(0)';
    }
  }
  
  showDislikeIndicator(): void {
    const likeIndicator = this.cardElement.nativeElement.querySelector('.like-indicator');
    const dislikeIndicator = this.cardElement.nativeElement.querySelector('.dislike-indicator');
    
    if (likeIndicator && dislikeIndicator) {
      likeIndicator.style.opacity = '0';
      likeIndicator.style.transform = 'translateY(-50%) rotate(20deg) scale(0)';
      dislikeIndicator.style.opacity = '1';
      dislikeIndicator.style.transform = 'translateY(-50%) rotate(-20deg) scale(1)';
    }
  }
  
  resetIndicators(): void {
    const likeIndicator = this.cardElement.nativeElement.querySelector('.like-indicator');
    const dislikeIndicator = this.cardElement.nativeElement.querySelector('.dislike-indicator');
    
    if (likeIndicator && dislikeIndicator) {
      likeIndicator.style.opacity = '0';
      likeIndicator.style.transform = 'translateY(-50%) rotate(20deg) scale(0)';
      dislikeIndicator.style.opacity = '0';
      dislikeIndicator.style.transform = 'translateY(-50%) rotate(-20deg) scale(0)';
    }
  }
  
  nextMedia(): void {
    if (this.ad.media && this.ad.media.length > 0) {
      this.currentMediaIndex = (this.currentMediaIndex + 1) % this.ad.media.length;
    }
  }
  
  prevMedia(): void {
    if (this.ad.media && this.ad.media.length > 0) {
      this.currentMediaIndex = (this.currentMediaIndex - 1 + this.ad.media.length) % this.ad.media.length;
    }
  }
  
  getCurrentMediaUrl(): string {
    if (this.ad.media && this.ad.media.length > 0) {
      return this.ad.media[this.currentMediaIndex].url;
    }
    return '/assets/images/default-profile.jpg';
  }
  
  isCurrentMediaVideo(): boolean {
    if (this.ad.media && this.ad.media.length > 0) {
      const media = this.ad.media[this.currentMediaIndex];
      return media.type === 'video';
    }
    return false;
  }
  
  getMediaDots(): number[] {
    if (this.ad.media && this.ad.media.length > 0) {
      return Array(this.ad.media.length).fill(0).map((_, i) => i);
    }
    return [];
  }
  
  onViewDetails(event: Event): void {
    event.stopPropagation();
    this.viewDetails.emit(this.ad._id);
  }
  
  onStartChat(event: Event): void {
    event.stopPropagation();
    this.startChat.emit(this.ad._id);
  }
}

// Interface for Hammer.js manager
interface HammerManager {
  destroy(): void;
}