import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbButtonModule, NbIconModule } from '@nebular/theme';
import { trigger, transition, style, animate } from '@angular/animations';

export interface CarouselItem {
  id: string | number;
  image: string;
  title?: string;
  description?: string;
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, NbButtonModule, NbIconModule],
  template: `
    <div class="carousel" [class.carousel--fullscreen]="fullscreen">
      <div class="carousel__container">
        <div class="carousel__slides">
          <div
            *ngFor="let item of items; let i = index"
            class="carousel__slide"
            [@slideAnimation]="currentIndex === i ? 'active' : 'inactive'"
            [class.carousel__slide--active]="currentIndex === i"
          >
            <img [src]="item.image" [alt]="item.title || ''" class="carousel__image" />

            <div class="carousel__content" *ngIf="item.title || item.description">
              <h3 class="carousel__title" *ngIf="item.title">{{ item.title }}</h3>
              <p class="carousel__description" *ngIf="item.description">{{ item.description }}</p>
            </div>
          </div>
        </div>

        <button
          nbButton
          ghost
          class="carousel__nav carousel__nav--prev"
          (click)="prev()"
          [disabled]="!loop && currentIndex === 0"
        >
          <nb-icon icon="chevron-left-outline"></nb-icon>
        </button>

        <button
          nbButton
          ghost
          class="carousel__nav carousel__nav--next"
          (click)="next()"
          [disabled]="!loop && currentIndex === items.length - 1"
        >
          <nb-icon icon="chevron-right-outline"></nb-icon>
        </button>

        <div class="carousel__indicators" *ngIf="showIndicators">
          <button
            *ngFor="let item of items; let i = index"
            class="carousel__indicator"
            [class.carousel__indicator--active]="currentIndex === i"
            (click)="goToSlide(i)"
          ></button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .carousel {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: var(--border-radius);
      }

      .carousel--fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 1000;
        background: var(--background-basic-color-1);
      }

      .carousel__container {
        position: relative;
        width: 100%;
        height: 100%;
      }

      .carousel__slides {
        position: relative;
        width: 100%;
        height: 100%;
      }

      .carousel__slide {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;

        &--active {
          opacity: 1;
          z-index: 1;
        }
      }

      .carousel__image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .carousel__content {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: var(--card-padding);
        background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
        color: white;
      }

      .carousel__title {
        margin: 0 0 var(--spacing);
        font-size: var(--text-heading-6-font-size);
      }

      .carousel__description {
        margin: 0;
        font-size: var(--text-caption-font-size);
        opacity: 0.9;
      }

      .carousel__nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 2;
        background: rgba(255, 255, 255, 0.1) !important;
        border-radius: 50% !important;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;

        &:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2) !important;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        nb-icon {
          color: white;
        }

        &--prev {
          left: var(--spacing);
        }

        &--next {
          right: var(--spacing);
        }
      }

      .carousel__indicators {
        position: absolute;
        bottom: var(--spacing);
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: var(--spacing-xs);
        z-index: 2;
      }

      .carousel__indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        border: none;
        padding: 0;
        cursor: pointer;
        transition: all 0.3s ease;

        &--active {
          background: white;
          transform: scale(1.2);
        }

        &:hover:not(&--active) {
          background: rgba(255, 255, 255, 0.7);
        }
      }
    `,
  ],
  animations: [
    trigger('slideAnimation', [
      transition('void => active', [
        style({ opacity: 0, transform: 'scale(1.1)' }),
        animate('300ms ease-in-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition('active => void', [
        animate('300ms ease-in-out', style({ opacity: 0, transform: 'scale(0.9)' })),
      ]),
    ]),
  ],
})
export class CarouselComponent {
  @Input() items: CarouselItem[] = [];
  @Input() loop = true;
  @Input() autoplay = false;
  @Input() autoplayInterval = 5000;
  @Input() showIndicators = true;
  @Input() fullscreen = false;
  @Output() slideChange = new EventEmitter<number>();

  currentIndex = 0;
  private autoplayTimer: any;

  ngOnInit() {
    if (this.autoplay) {
      this.startAutoplay();
    }
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  next() {
    if (this.currentIndex < this.items.length - 1) {
      this.goToSlide(this.currentIndex + 1);
    } else if (this.loop) {
      this.goToSlide(0);
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.goToSlide(this.currentIndex - 1);
    } else if (this.loop) {
      this.goToSlide(this.items.length - 1);
    }
  }

  goToSlide(index: number) {
    this.currentIndex = index;
    this.slideChange.emit(index);
    this.resetAutoplay();
  }

  private startAutoplay() {
    this.autoplayTimer = setInterval(() => {
      this.next();
    }, this.autoplayInterval);
  }

  private stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
    }
  }

  private resetAutoplay() {
    if (this.autoplay) {
      this.stopAutoplay();
      this.startAutoplay();
    }
  }
}
