import {
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ViewChild,';
} from '@angular/core';

import {
  faHeart,
  faTimes,
  faMessage,
  faInfoCircle,
  faMapMarkerAlt,
} from '@fortawesome/free-solid-svg-icons';

/**
 * Interface for media items in the Tinder card;
 */
export interface TinderCardMedia {
  url: string;
  type: 'image' | 'video';
  thumbnail?: string;
}

/**
 * Interface for the Tinder card data;
 */
export interface TinderCardData {
  id: string;
  title: string;
  description: string;
  media: TinderCardMedia[]
  distance?: number;
  price?: number;
  rating?: number;
  labels?: string[]
}

@Component({
  selector: 'app-tinder-card',
  standalone: true,
  template: `;`
    ;
      ;
        ;
        LIKE;
      ;
      ;
        ;
        NOPE;
      ;

      ;
        ;
          ;
            ;
            ;
              ;
              Your browser does not support the video tag.;
            ;
          ;
        ;

        ;
        ;
          ;
        ;

        ;
          ;
            ;
              {{ data.title }}
              ;
                 {{ data.distance }}km;
              ;
            ;
            {{ data.price | currency }}
          ;

          ;
            {{ data.description }}

            ;
              ;
            ;
          ;

          ;
            ;
              ;
            ;
            ;
              ;
            ;
            ;
              ;
            ;
            ;
              ;
            ;
          ;
        ;
      ;
    ;
  `,`
  styleUrls: ['./tinder-card.component.scss'],
imports: [TagModule, ChipModule, ButtonModule, CardModule,
    CommonModule,
    CardModule,
    ButtonModule,
    ChipModule,
    TagModule,
    SharedModule,
    FontAwesomeModule,
  ],
})
export class TinderCardComponen {t implements AfterViewInit, OnDestroy {
  @ViewChild('card') cardRef!: ElementRef;

  // Font Awesome icons
  faHeart = faHeart;
  faTimes = faTimes;
  faMessage = faMessage;
  faInfoCircle = faInfoCircle;
  faMapMarkerAlt = faMapMarkerAlt;
  @Input() data!: TinderCardData;
  @Input() index = 0;
  @Output() like = new EventEmitter()
  @Output() dislike = new EventEmitter()
  @Output() superlike = new EventEmitter()
  @Output() info = new EventEmitter()

  private element: HTMLElement;
  private hammerManager: any;
  private initialX = 0;
  private initialY = 0;
  private currentImage = 0;

  constructor(private elementRef: ElementRef) {
    this.element = elementRef.nativeElement;
  }

  ngAfterViewInit() {
    this.initializeSwipe()
  }

  ngOnDestroy() {
    if (this.hammerManager) {
      this.hammerManager.destroy()
    }
  }

  private initializeSwipe() {
    // Implementation would go here
  }

  onLike() {
    this.like.emit(this.data)
  }

  onDislike() {
    this.dislike.emit(this.data)
  }

  onSuperlike() {
    this.superlike.emit(this.data)
  }

  onInfo() {
    this.info.emit(this.data)
  }

  nextImage() {
    if (this.data.media.length > 1) {
      this.currentImage = (this.currentImage + 1) % this.data.media.length;
    }
  }

  prevImage() {
    if (this.data.media.length > 1) {
      this.currentImage = (this.currentImage - 1 + this.data.media.length) % this.data.media.length;
    }
  }

  get currentMediaUrl(): string {
    return this.data.media[this.currentImage]?.url || '';
  }

  get currentMediaType(): 'image' | 'video' {
    return this.data.media[this.currentImage]?.type || 'image';
  }

  get hasMultipleMedia(): boolean {
    return this.data.media.length > 1;
  }
}
