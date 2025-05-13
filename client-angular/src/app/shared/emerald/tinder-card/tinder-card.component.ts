import { NbTagModule } from '@nebular/theme';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains the Tinder card component
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelComponent } from '../components/label/label.component';

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
  selector: 'nb-flip-card',
  templateUrl: './tinder-card.component.html',
  styleUrls: ['./tinder-card.component.scss'],
  standalone: true,
  imports: [CommonModule, LabelComponent
    NbTagModule,],
})
export class TinderCardComponent implements AfterViewInit, OnDestroy {
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
