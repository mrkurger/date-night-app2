import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2, NgZone } from '@angular/core';

/**
 * LazyImageDirective
 *
 * This directive implements lazy loading for images to improve performance.
 * It uses the Intersection Observer API to load images only when they enter the viewport.
 *
 * Usage:
 * ```html
 * <img appLazyImage [src]="imageUrl" [placeholder]="placeholderUrl" />
 * ```
 *
 * @example
 * <img
 *   appLazyImage
 *   src="https://example.com/large-image.jpg"
 *   placeholder="https://example.com/placeholder.jpg"
 *   [threshold]="0.1"
 *   [loadingClass]="'image-loading'"
 *   [loadedClass]="'image-loaded'"
 *   [errorClass]="'image-error'"
 * />
 */
@Directive({
  selector: '[appLazyImage]',
  standalone: true,
})
export class LazyImageDirective implements OnInit, OnDestroy {
  @Input() src!: string;
  @Input() placeholder?: string;
  @Input() threshold: number = 0.1;
  @Input() rootMargin: string = '0px';
  @Input() loadingClass: string = 'lazy-loading';
  @Input() loadedClass: string = 'lazy-loaded';
  @Input() errorClass: string = 'lazy-error';

  private observer: IntersectionObserver | null = null;
  private isLoaded: boolean = false;
  private hasError: boolean = false;

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private renderer: Renderer2,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    // Set placeholder if provided
    if (this.placeholder) {
      this.renderer.setAttribute(this.el.nativeElement, 'src', this.placeholder);
    } else {
      // Use a transparent pixel as default placeholder
      this.renderer.setAttribute(
        this.el.nativeElement,
        'src',
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      );
    }

    // Add loading class
    this.renderer.addClass(this.el.nativeElement, this.loadingClass);

    // Store the actual src in a data attribute
    this.renderer.setAttribute(this.el.nativeElement, 'data-src', this.src);

    // Create and start the intersection observer
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    this.cleanupIntersectionObserver();
  }

  /**
   * Sets up the Intersection Observer to detect when the image enters the viewport
   */
  private setupIntersectionObserver(): void {
    // Run outside Angular zone for better performance
    this.ngZone.runOutsideAngular(() => {
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && !this.isLoaded && !this.hasError) {
                this.loadImage();
              }
            });
          },
          {
            threshold: this.threshold,
            rootMargin: this.rootMargin,
          },
        );

        this.observer.observe(this.el.nativeElement);
      } else {
        // Fallback for browsers that don't support IntersectionObserver
        this.loadImage();
      }
    });
  }

  /**
   * Loads the actual image
   */
  private loadImage(): void {
    const img = new Image();
    const src = this.el.nativeElement.getAttribute('data-src') || '';

    img.onload = () => {
      // Run inside Angular zone to trigger change detection
      this.ngZone.run(() => {
        this.renderer.removeClass(this.el.nativeElement, this.loadingClass);
        this.renderer.addClass(this.el.nativeElement, this.loadedClass);
        this.renderer.setAttribute(this.el.nativeElement, 'src', src);
        this.isLoaded = true;
        this.cleanupIntersectionObserver();
      });
    };

    img.onerror = () => {
      // Run inside Angular zone to trigger change detection
      this.ngZone.run(() => {
        this.renderer.removeClass(this.el.nativeElement, this.loadingClass);
        this.renderer.addClass(this.el.nativeElement, this.errorClass);
        this.hasError = true;
        this.cleanupIntersectionObserver();
      });
    };

    img.src = src;
  }

  /**
   * Cleans up the Intersection Observer
   */
  private cleanupIntersectionObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
