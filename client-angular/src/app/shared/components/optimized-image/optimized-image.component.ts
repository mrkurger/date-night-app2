import { Component, Input, OnInit, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageOptimizationService } from '../../../core/services/image-optimization.service';

@Component({
  selector: 'app-optimized-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    <img
      [src]="optimizedSrc"
      [srcset]="srcset"
      [alt]="alt"
      [width]="width"
      [height]="height"
      [ngClass]="{'lazy-loaded': loaded}"
      loading="lazy"
      (load)="onImageLoad()"
      class="optimized-image"
    />
    <div *ngIf="!loaded" class="placeholder-container">
      <img 
        [src]="placeholderSrc" 
        [alt]="'Loading ' + alt"
        class="placeholder-image"
      />
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
      overflow: hidden;
    }
    
    .optimized-image {
      width: 100%;
      height: auto;
      display: block;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    }
    
    .lazy-loaded {
      opacity: 1;
    }
    
    .placeholder-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .placeholder-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: blur(10px);
    }
  `]
})
export class OptimizedImageComponent implements OnInit {
  @Input() src!: string;
  @Input() alt: string = '';
  @Input() width: number = 0;
  @Input() height: number = 0;
  @Input() sizes: string = '100vw';
  @Input() priority: boolean = false;
  
  @HostBinding('style.width') get hostWidth() {
    return this.width ? `${this.width}px` : 'auto';
  }
  
  @HostBinding('style.height') get hostHeight() {
    return this.height ? `${this.height}px` : 'auto';
  }
  
  optimizedSrc: string = '';
  srcset: string = '';
  placeholderSrc: string = '';
  loaded: boolean = false;
  
  constructor(private imageService: ImageOptimizationService) {}
  
  ngOnInit(): void {
    // Generate optimized image URLs
    this.optimizedSrc = this.imageService.getOptimizedUrl(this.src, this.width || 800);
    this.srcset = this.imageService.generateSrcset(this.src);
    this.placeholderSrc = this.imageService.getPlaceholderUrl(this.src);
    
    // If priority is true, preload the image
    if (this.priority) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = this.optimizedSrc;
      document.head.appendChild(link);
      
      // Mark as loaded immediately for priority images
      this.loaded = true;
    }
  }
  
  onImageLoad(): void {
    this.loaded = true;
  }
}