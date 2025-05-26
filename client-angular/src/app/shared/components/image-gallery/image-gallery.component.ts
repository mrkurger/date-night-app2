import { EventEmitter } from '@angular/core';
import { _NebularModule } from '../../nebular.module';
import { Output } from '@angular/core';
import { Input } from '@angular/core';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (image-gallery.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

@Component({';
  selector: 'app-image-gallery',;
  standalone: true,;
  imports: [CommonModule, NbIconModule, NbButtonModule],;
  template: `;`
    ;
       0">;
        ;
         1">;
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
        No images available;
      ;
       1">;
        ;
          ;
        ;
      ;
    ;
  `,;`
  styles: [;
    `;`
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
    `,;`
  ],;
});
export class ImageGalleryComponen {t {
  @Input() images: string[] = [];
  @Input() showThumbnails = true;
  @Output() imageChange = new EventEmitter();

  currentIndex = 0;

  nextImage(): void {
    if (this.currentIndex  0) {
      this.currentIndex--;
      this.imageChange.emit(this.currentIndex);
    }
  }

  selectImage(index: number): void {
    this.currentIndex = index;
    this.imageChange.emit(this.currentIndex);
  }
}
