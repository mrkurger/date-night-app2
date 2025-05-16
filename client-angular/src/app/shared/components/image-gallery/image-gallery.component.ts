
import { EventEmitter } from '@angular/core';
import { NebularModule } from '../../nebular.module';

import { Output } from '@angular/core';
import { Input } from '@angular/core';
import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (image-gallery.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [
    CommonModule,
    NbIconModule,
    NbButtonModule
  ],
  template: `
    <div class="gallery-container">
      <div class="gallery-main" *ngIf="images.length > 0">
        <img
          [src]="images[currentIndex]"
          [alt]="'Image ' + (currentIndex + 1)"
          class="main-image"
        />
        <div class="gallery-controls" *ngIf="images.length > 1">
          <button
            nbButton
            ghost
            class="nav-button prev"
            (click)="prevImage()"
            [disabled]="currentIndex === 0"
          >
            <nb-icon icon="chevron-left"></nb-icon>
          </button>
          <button
            nbButton
            ghost
            class="nav-button next"
            (click)="nextImage()"
            [disabled]="currentIndex === images.length - 1"
          >
            <nb-icon icon="chevron-right"></nb-icon>
          </button>
        </div>
      </div>
      <div class="gallery-empty" *ngIf="images.length === 0">
        <nb-icon icon="image-outline"></nb-icon>
        <p>No images available</p>
      </div>
      <div class="gallery-thumbnails" *ngIf="showThumbnails && images.length > 1">
        <div
          *ngFor="let image of images; let i = index"
          class="thumbnail"
          [class.active]="i === currentIndex"
          (click)="selectImage(i)"
        >
          <img [src]="image" [alt]="'Thumbnail ' + (i + 1)" />
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .gallery-container {
        display: flex;
        flex-direction: column;
        width: 100%;
      }
      .gallery-main {
        position: relative;
        width: 100%;
        height: 0;
        padding-bottom: 75%;
        overflow: hidden;
        border-radius: var(--border-radius);
      }
      .main-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: opacity 0.3s ease;
      }
      .gallery-controls {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 10px;
      }
      .nav-button {
        background-color: rgba(0, 0, 0, 0.5);
        color: var(--text-control-color);
        &:hover:not(:disabled) {
          background-color: rgba(0, 0, 0, 0.7);
        }
      }
      .gallery-thumbnails {
        display: flex;
        overflow-x: auto;
        margin-top: 10px;
        gap: 8px;
      }
      .thumbnail {
        width: 60px;
        height: 60px;
        border-radius: var(--border-radius);
        overflow: hidden;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.3s ease;
      }
      .thumbnail.active {
        opacity: 1;
        border: 2px solid var(--color-primary-500);
      }
      .thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .gallery-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
        background-color: var(--background-basic-color-2);
        border-radius: var(--border-radius);
        color: var(--text-hint-color);
      }
      nb-icon {
        font-size: 48px;
        height: 48px;
        width: 48px;
        margin-bottom: 16px;
      }
    `,
  ],
})
export class ImageGalleryComponent {
  @Input() images: string[] = [];
  @Input() showThumbnails = true;
  @Output() imageChange = new EventEmitter<number>();

  currentIndex = 0;

  nextImage(): void {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
      this.imageChange.emit(this.currentIndex);
    }
  }

  prevImage(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.imageChange.emit(this.currentIndex);
    }
  }

  selectImage(index: number): void {
    this.currentIndex = index;
    this.imageChange.emit(this.currentIndex);
  }
}
