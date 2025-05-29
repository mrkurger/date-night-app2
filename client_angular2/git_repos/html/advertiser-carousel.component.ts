import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

export interface Advertiser {
  id: string | number;
  name: string;
  age?: number;
  location?: string;
  distance?: number;
  image?: string;
  isVip?: boolean;
  isOnline?: boolean;
  isPremium?: boolean;
}

@Component({
  selector: 'app-advertiser-carousel',
  templateUrl: './advertiser-carousel.component.html',
  styleUrls: ['./advertiser-carousel.component.scss'],
  animations: [
    trigger('infoAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(300px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(300px)', opacity: 0 }))
      ])
    ])
  ]
})
export class AdvertiserCarouselComponent implements AfterViewInit, OnDestroy {
  @Input() advertisers: Advertiser[] = [];
  @Input() title?: string;
  @Input() variant: 'default' | 'premium' = 'default';
  
  @ViewChild('carouselRef') carouselRef!: ElementRef<HTMLDivElement>;
  
  showInfo: number | string | null = null;
  scrollPosition = 0;
  canScrollLeft = false;
  canScrollRight = true;
  
  private scrollListener: any;
  
  get isPremium(): boolean {
    return this.variant === 'premium';
  }
  
  constructor(private router: Router) {}
  
  ngAfterViewInit(): void {
    if (this.carouselRef && this.carouselRef.nativeElement) {
      this.scrollListener = this.onScroll.bind(this);
      this.carouselRef.nativeElement.addEventListener('scroll', this.scrollListener);
      
      // Initial check for scroll buttons
      setTimeout(() => this.updateScrollButtons(), 0);
    }
  }
  
  ngOnDestroy(): void {
    if (this.carouselRef && this.carouselRef.nativeElement && this.scrollListener) {
      this.carouselRef.nativeElement.removeEventListener('scroll', this.scrollListener);
    }
  }
  
  onScroll(): void {
    this.updateScrollButtons();
  }
  
  updateScrollButtons(): void {
    if (!this.carouselRef || !this.carouselRef.nativeElement) return;
    
    const container = this.carouselRef.nativeElement;
    this.scrollPosition = container.scrollLeft;
    this.canScrollLeft = this.scrollPosition > 0;
    this.canScrollRight = this.scrollPosition < container.scrollWidth - container.clientWidth - 10;
  }
  
  handleScroll(direction: 'left' | 'right'): void {
    if (!this.carouselRef || !this.carouselRef.nativeElement) return;
    
    const container = this.carouselRef.nativeElement;
    const cardWidth = this.isPremium ? 350 : 280; // approximate width of each card including gap
    const scrollAmount = cardWidth * (this.isPremium ? 1 : 2); // scroll by 1 or 2 cards at a time
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
    
    this.showInfo = null;
  }
  
  toggleInfo(id: string | number): void {
    this.showInfo = this.showInfo === id ? null : id;
  }
  
  viewProfile(event: Event, id: string | number): void {
    event.stopPropagation();
    this.router.navigate(['/advertiser', id]);
  }
}