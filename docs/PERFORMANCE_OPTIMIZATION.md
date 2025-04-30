# Performance Optimization Guide for DateNight.io

This guide provides best practices and techniques for optimizing the performance of the DateNight.io application. Following these guidelines will help ensure a fast and responsive user experience.

## Table of Contents

1. [Angular Performance Optimization](#angular-performance-optimization)
2. [Network Optimization](#network-optimization)
3. [Rendering Optimization](#rendering-optimization)
4. [Asset Optimization](#asset-optimization)
5. [Memory Management](#memory-management)
6. [Performance Monitoring](#performance-monitoring)
7. [Mobile Performance](#mobile-performance)
8. [Server-Side Optimization](#server-side-optimization)
9. [Tools and Resources](#tools-and-resources)

## Angular Performance Optimization

### Change Detection

- Use `OnPush` change detection strategy for components that don't need frequent updates:

  ```typescript
  @Component({
    selector: 'app-my-component',
    templateUrl: './my-component.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  ```

- Detach change detection for components that manage their own updates:

  ```typescript
  constructor(private cdr: ChangeDetectorRef) {
    this.cdr.detach();
  }

  // Manually trigger change detection when needed
  updateView() {
    this.cdr.detectChanges();
  }
  ```

- Run code outside Angular zone for performance-intensive operations:

  ```typescript
  constructor(private ngZone: NgZone) {}

  performHeavyCalculation() {
    this.ngZone.runOutsideAngular(() => {
      // Heavy calculation code here

      // Run back inside Angular zone to update the UI
      this.ngZone.run(() => {
        this.updateUI();
      });
    });
  }
  ```

### Memoization and Pure Pipes

- Use pure pipes for transformations in templates:

  ```typescript
  @Pipe({
    name: 'filter',
    pure: true,
  })
  export class FilterPipe implements PipeTransform {
    transform(items: any[], filterFn: (item: any) => boolean): any[] {
      return items.filter(filterFn);
    }
  }
  ```

- Use memoization for expensive calculations:

  ```typescript
  import { PerformanceUtil } from '@core/utils/performance.util';

  const performanceUtil = PerformanceUtil.getInstance();
  const memoizedCalculation = performanceUtil.memoize((input: number) => {
    // Expensive calculation
    return input * input;
  });
  ```

### Lazy Loading

- Lazy load feature modules:

  ```typescript
  const routes: Routes = [
    {
      path: 'feature',
      loadChildren: () => import('./feature/feature.module').then(m => m.FeatureModule),
    },
  ];
  ```

- Use the `LazyImageDirective` for images:
  ```html
  <img appLazyImage src="large-image.jpg" placeholder="placeholder.jpg" />
  ```

## Network Optimization

### API Caching

- Use the `ApiCacheService` for caching API responses:

  ```typescript
  constructor(private apiCache: ApiCacheService) {}

  getData(): Observable<any> {
    return this.apiCache.get('/api/data');
  }
  ```

### Request Optimization

- Batch API requests where possible:

  ```typescript
  // Instead of multiple separate requests
  this.http.get('/api/users/1');
  this.http.get('/api/users/2');

  // Use a batch endpoint
  this.http.get('/api/users?ids=1,2');
  ```

- Use GraphQL for complex data requirements:

  ```typescript
  const query = `
    query {
      user(id: 1) {
        name
        profile {
          avatar
        }
        posts {
          title
        }
      }
    }
  `;

  this.http.post('/graphql', { query });
  ```

### Compression and Minification

- Enable Gzip or Brotli compression on the server
- Minify all JavaScript, CSS, and HTML files
- Use the Angular production build:
  ```bash
  ng build --prod
  ```

## Rendering Optimization

### Virtual Scrolling

- Use Angular's `<cdk-virtual-scroll-viewport>` for long lists:
  ```html
  <cdk-virtual-scroll-viewport itemSize="50" class="viewport">
    <div *cdkVirtualFor="let item of items" class="item">{{ item }}</div>
  </cdk-virtual-scroll-viewport>
  ```

### Optimized Rendering

- Use `trackBy` with `*ngFor` to improve rendering performance:

  ```html
  <div *ngFor="let item of items; trackBy: trackByFn">{{ item.name }}</div>
  ```

  ```typescript
  trackByFn(index: number, item: any): number {
    return item.id;
  }
  ```

- Avoid expensive calculations in templates:

  ```html
  <!-- Bad -->
  <div>{{ getExpensiveValue() }}</div>

  <!-- Good -->
  <div>{{ expensiveValue }}</div>
  ```

  ```typescript
  // Calculate once and store the result
  ngOnInit() {
    this.expensiveValue = this.getExpensiveValue();
  }
  ```

## Asset Optimization

### Image Optimization

- Use appropriate image formats:

  - JPEG for photographs
  - PNG for images with transparency
  - SVG for icons and simple graphics
  - WebP for better compression (with fallbacks)

- Use responsive images with `srcset`:

  ```html
  <img
    src="image-small.jpg"
    srcset="image-small.jpg 400w, image-medium.jpg 800w, image-large.jpg 1200w"
    sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
    alt="Description"
  />
  ```

- Optimize SVG files:
  - Remove unnecessary metadata
  - Simplify paths
  - Use tools like SVGO

### Font Optimization

- Use system fonts where possible
- Limit the number of font weights and styles
- Use font-display: swap to prevent FOIT (Flash of Invisible Text):
  ```css
  @font-face {
    font-family: 'MyFont';
    src: url('myfont.woff2') format('woff2');
    font-display: swap;
  }
  ```

## Memory Management

### Memory Leaks Prevention

- Unsubscribe from all observables:

  ```typescript
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.dataService.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.data = data);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ```

- Clear timers and intervals:

  ```typescript
  private timerId: any;

  ngOnInit() {
    this.timerId = setInterval(() => this.checkData(), 1000);
  }

  ngOnDestroy() {
    clearInterval(this.timerId);
  }
  ```

- Remove event listeners:

  ```typescript
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    // Handle resize
  }

  // Angular automatically removes @HostListener when component is destroyed
  ```

### Memory Usage Monitoring

- Use the `PerformanceMonitorService` to monitor memory usage:
  ```typescript
  constructor(private performanceMonitor: PerformanceMonitorService) {
    this.performanceMonitor.getMetrics().subscribe(metrics => {
      console.log(`Memory usage: ${metrics.memoryUsage} MB`);
    });
  }
  ```

## Performance Monitoring

### Core Web Vitals

- Monitor Core Web Vitals:

  - Largest Contentful Paint (LCP): < 2.5s
  - First Input Delay (FID): < 100ms
  - Cumulative Layout Shift (CLS): < 0.1

- Use the `PerformanceMonitorService` to track these metrics:
  ```typescript
  constructor(private performanceMonitor: PerformanceMonitorService) {
    this.performanceMonitor.getMetrics().subscribe(metrics => {
      console.log(`LCP: ${metrics.largestContentfulPaint}ms`);
      console.log(`FID: ${metrics.firstInputDelay}ms`);
      console.log(`CLS: ${metrics.cumulativeLayoutShift}`);
    });
  }
  ```

### Performance Budgets

- Set performance budgets in `angular.json`:
  ```json
  "budgets": [
    {
      "type": "initial",
      "maximumWarning": "500kb",
      "maximumError": "1mb"
    },
    {
      "type": "anyComponentStyle",
      "maximumWarning": "2kb",
      "maximumError": "4kb"
    }
  ]
  ```

### Monitoring Tools

- Use Lighthouse for performance audits
- Use Chrome DevTools Performance panel for detailed analysis
- Use the Angular DevTools extension for Angular-specific performance insights

## Mobile Performance

### Mobile-Specific Optimizations

- Use responsive design with mobile-first approach
- Optimize touch interactions:

  - Ensure touch targets are at least 44x44 pixels
  - Implement touch feedback
  - Minimize input latency

- Reduce JavaScript execution time:
  - Split code into smaller chunks
  - Defer non-critical JavaScript
  - Use Web Workers for CPU-intensive tasks

### Progressive Web App (PWA)

- Implement service workers for offline support
- Use app shell architecture for instant loading
- Add a web app manifest for installability

## Server-Side Optimization

### Server-Side Rendering (SSR)

- Use Angular Universal for server-side rendering:

  ```bash
  ng add @nguniversal/express-engine
  ```

- Implement transfer state to avoid duplicate requests:

  ```typescript
  import { TransferState, makeStateKey } from '@angular/platform-browser';

  const DATA_KEY = makeStateKey<any>('my-data');

  constructor(private transferState: TransferState, private http: HttpClient) {}

  getData() {
    // Check if data exists in transfer state
    if (this.transferState.hasKey(DATA_KEY)) {
      return of(this.transferState.get(DATA_KEY, null));
    }

    // Otherwise fetch from API
    return this.http.get('/api/data').pipe(
      tap(data => {
        // Store in transfer state
        this.transferState.set(DATA_KEY, data);
      })
    );
  }
  ```

### API Optimization

- Implement pagination for large data sets:

  ```typescript
  this.http.get('/api/items?page=1&pageSize=20');
  ```

- Use filtering and sorting on the server:

  ```typescript
  this.http.get('/api/items?sort=name&order=asc&category=books');
  ```

- Implement data compression for API responses

## Tools and Resources

### Performance Tools

- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Chrome DevTools Performance panel](https://developers.google.com/web/tools/chrome-devtools/evaluate-performance)
- [Angular DevTools](https://angular.io/guide/devtools)
- [WebPageTest](https://www.webpagetest.org/)

### DateNight.io Performance Utilities

- `PerformanceUtil`: Utility for performance optimization
- `PerformanceMonitorService`: Service for monitoring performance
- `ApiCacheService`: Service for caching API responses
- `LazyImageDirective`: Directive for lazy loading images
- `PerformanceModule`: Module for performance optimization

### Further Reading

- [Angular Performance Optimization](https://angular.io/guide/performance-optimization)
- [Web Vitals](https://web.dev/vitals/)
- [High Performance Browser Networking](https://hpbn.co/)
- [You Don't Know JS: Async & Performance](https://github.com/getify/You-Dont-Know-JS/tree/1st-ed/async%20%26%20performance)

---

This guide is part of the DateNight.io documentation. It serves as a reference for developers to ensure optimal performance of the application.

Last Updated: 2025-05-15
