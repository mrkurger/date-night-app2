import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared.module';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faHeart,
  faTimes,
  faMessage,
  faInfoCircle,
  faMapMarkerAlt,
} from '@fortawesome/free-solid-svg-icons';

/**
 * Interface for media items in the Tinder card
 */
export interface TinderCardMedia {
  url: string;
  type: 'image' | 'video';
  thumbnail?: string;
}

/**
 * Interface for the Tinder card data
 */
export interface TinderCardData {
  id: string;
  title: string;
  description: string;
  media: TinderCardMedia[];
  distance?: number;
  price?: number;
  rating?: number;
  labels?: string[];
}

@Component({
  selector: 'app-tinder-card',
  standalone: true,
  template: `
    <p-card
      #card
      [ngClass]="{
        'tinder-card': true,
        swiping: isSwiping,
        liked: isLiked,
        disliked: isDisliked,
      }"
      [style]="cardStyle"
    >
      <div class="like-indicator" [class.visible]="showLikeIndicator">
        <fa-icon [icon]="faHeart" class="text-success"></fa-icon>
        <span>LIKE</span>
      </div>
      <div class="dislike-indicator" [class.visible]="showDislikeIndicator">
        <fa-icon [icon]="faTimes" class="text-danger"></fa-icon>
        <span>NOPE</span>
      </div>

      <div class="media-container">
        <div class="media-item" [ngStyle]="mediaStyle">
          <ng-container [ngSwitch]="currentMediaType">
            <img
              *ngSwitchCase="'image'"
              [src]="currentMediaUrl"
              [alt]="data.title"
              class="media-image"
            />
            <video *ngSwitchCase="'video'" controls class="media-video">
              <source [src]="currentMediaUrl" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </ng-container>
        </div>

        <!-- Media Navigation Dots -->
        <div class="media-dots" *ngIf="hasMultipleMedia">
          <div
            *ngFor="let _ of data.media; let i = index"
            class="media-dot"
            [class.active]="i === currentImage"
            (click)="$event.stopPropagation(); currentImage = i"
          ></div>
        </div>

        <div class="card-content">
          <div class="card-header">
            <h3 class="card-title">
              {{ data.title }}
              <span class="card-subtitle" *ngIf="data.distance">
                <fa-icon [icon]="faMapMarkerAlt"></fa-icon> {{ data.distance }}km
              </span>
            </h3>
            <p class="card-price" *ngIf="data.price">{{ data.price | currency }}</p>
          </div>

          <div class="card-body">
            <p class="card-description">{{ data.description }}</p>

            <div class="card-tags" *ngIf="data.labels?.length">
              <p-chip *ngFor="let tag of data.labels" [label]="tag" styleClass="p-mr-2"></p-chip>
            </div>
          </div>

          <div class="card-footer">
            <button
              pButton
              class="p-button-rounded p-button-info"
              (click)="$event.stopPropagation(); onInfo()"
            >
              <fa-icon [icon]="faInfoCircle"></fa-icon>
            </button>
            <button
              pButton
              class="p-button-rounded p-button-danger"
              (click)="$event.stopPropagation(); onDislike()"
            >
              <fa-icon [icon]="faTimes"></fa-icon>
            </button>
            <button
              pButton
              class="p-button-rounded p-button-success"
              (click)="$event.stopPropagation(); onLike()"
            >
              <fa-icon [icon]="faHeart"></fa-icon>
            </button>
            <button
              pButton
              class="p-button-rounded p-button-primary"
              (click)="$event.stopPropagation(); onSuperlike()"
            >
              <fa-icon [icon]="faMessage"></fa-icon>
            </button>
          </div>
        </div>
      </div>
    </p-card>
  `,
  styleUrls: ['./tinder-card.component.scss'],
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ChipModule,
    TagModule,
    SharedModule,
    FontAwesomeModule,
  ],
})
export class TinderCardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('card') cardRef!: ElementRef;

  // Font Awesome icons
  faHeart = faHeart;
  faTimes = faTimes;
  faMessage = faMessage;
  faInfoCircle = faInfoCircle;
  faMapMarkerAlt = faMapMarkerAlt;
  @Input() data!: TinderCardData;
  @Input() index = 0;
  @Output() like = new EventEmitter<TinderCardData>();
  @Output() dislike = new EventEmitter<TinderCardData>();
  @Output() superlike = new EventEmitter<TinderCardData>();
  @Output() info = new EventEmitter<TinderCardData>();

  private element: HTMLElement;
  private hammerManager: any;
  private initialX = 0;
  private initialY = 0;
  private currentImage = 0;

  constructor(private elementRef: ElementRef) {
    this.element = elementRef.nativeElement;
  }

  ngAfterViewInit() {
    this.initializeSwipe();
  }

  ngOnDestroy() {
    if (this.hammerManager) {
      this.hammerManager.destroy();
    }
  }

  private initializeSwipe() {
    // Implementation would go here
  }

  onLike() {
    this.like.emit(this.data);
  }

  onDislike() {
    this.dislike.emit(this.data);
  }

  onSuperlike() {
    this.superlike.emit(this.data);
  }

  onInfo() {
    this.info.emit(this.data);
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
