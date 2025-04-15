import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';

import { CardGridComponent } from './card-grid.component';

// Mock item for testing
interface MockItem {
  id: string;
  title: string;
}

// Mock component that uses CardGrid
@Component({
  template: `
    <emerald-card-grid
      [items]="items"
      [layout]="layout"
      [gap]="gap"
      [animated]="animated"
      [itemsPerRow]="itemsPerRow"
      (itemClick)="onItemClick($event)">
      <ng-template #itemTemplate let-item>
        <div class="mock-item" [attr.data-id]="item.id">{{ item.title }}</div>
      </ng-template>
    </emerald-card-grid>
  `
})
class TestHostComponent {
  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  
  items: MockItem[] = [
    { id: '1', title: 'Item 1' },
    { id: '2', title: 'Item 2' },
    { id: '3', title: 'Item 3' },
    { id: '4', title: 'Item 4' },
    { id: '5', title: 'Item 5' }
  ];
  
  layout: 'grid' | 'masonry' | 'netflix' = 'grid';
  gap: number = 16;
  animated: boolean = true;
  itemsPerRow = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5
  };
  
  onItemClick(item: any) {}
}

describe('CardGridComponent', () => {
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestHostComponent],
      imports: [CardGridComponent]
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  it('should create', () => {
    const cardGridComponent = hostFixture.debugElement.query(By.directive(CardGridComponent));
    expect(cardGridComponent).toBeTruthy();
  });

  describe('Basic Rendering', () => {
    it('should render all items', () => {
      const itemElements = hostFixture.debugElement.queryAll(By.css('.mock-item'));
      expect(itemElements.length).toBe(5);
    });

    it('should apply the correct layout class', () => {
      const cardGridElement = hostFixture.debugElement.query(By.css('.emerald-card-grid'));
      expect(cardGridElement.nativeElement.classList).toContain('emerald-card-grid--grid');
      
      hostComponent.layout = 'netflix';
      hostFixture.detectChanges();
      
      expect(cardGridElement.nativeElement.classList).toContain('emerald-card-grid--netflix');
    });

    it('should apply gap style', () => {
      const cardGridElement = hostFixture.debugElement.query(By.css('.emerald-card-grid'));
      expect(cardGridElement.nativeElement.style.gap).toBe('16px');
      
      hostComponent.gap = 24;
      hostFixture.detectChanges();
      
      expect(cardGridElement.nativeElement.style.gap).toBe('24px');
    });

    it('should apply animation class when animated is true', () => {
      const cardGridElement = hostFixture.debugElement.query(By.css('.emerald-card-grid'));
      expect(cardGridElement.nativeElement.classList).toContain('emerald-card-grid--animated');
      
      hostComponent.animated = false;
      hostFixture.detectChanges();
      
      expect(cardGridElement.nativeElement.classList).not.toContain('emerald-card-grid--animated');
    });
  });

  describe('Responsive Behavior', () => {
    it('should apply responsive grid classes', () => {
      const cardGridElement = hostFixture.debugElement.query(By.css('.emerald-card-grid'));
      
      // Check for responsive classes
      expect(cardGridElement.nativeElement.classList).toContain('emerald-card-grid--xs-1');
      expect(cardGridElement.nativeElement.classList).toContain('emerald-card-grid--sm-2');
      expect(cardGridElement.nativeElement.classList).toContain('emerald-card-grid--md-3');
      expect(cardGridElement.nativeElement.classList).toContain('emerald-card-grid--lg-4');
      expect(cardGridElement.nativeElement.classList).toContain('emerald-card-grid--xl-5');
      
      // Update itemsPerRow
      hostComponent.itemsPerRow = {
        xs: 2,
        sm: 3,
        md: 4,
        lg: 5,
        xl: 6
      };
      hostFixture.detectChanges();
      
      // Check updated classes
      expect(cardGridElement.nativeElement.classList).toContain('emerald-card-grid--xs-2');
      expect(cardGridElement.nativeElement.classList).toContain('emerald-card-grid--sm-3');
      expect(cardGridElement.nativeElement.classList).toContain('emerald-card-grid--md-4');
      expect(cardGridElement.nativeElement.classList).toContain('emerald-card-grid--lg-5');
      expect(cardGridElement.nativeElement.classList).toContain('emerald-card-grid--xl-6');
    });
  });

  describe('Layout Variations', () => {
    it('should apply grid layout correctly', () => {
      hostComponent.layout = 'grid';
      hostFixture.detectChanges();
      
      const cardGridElement = hostFixture.debugElement.query(By.css('.emerald-card-grid'));
      expect(cardGridElement.nativeElement.classList).toContain('emerald-card-grid--grid');
    });

    it('should apply masonry layout correctly', () => {
      hostComponent.layout = 'masonry';
      hostFixture.detectChanges();
      
      const cardGridElement = hostFixture.debugElement.query(By.css('.emerald-card-grid'));
      expect(cardGridElement.nativeElement.classList).toContain('emerald-card-grid--masonry');
    });

    it('should apply netflix layout correctly', () => {
      hostComponent.layout = 'netflix';
      hostFixture.detectChanges();
      
      const cardGridElement = hostFixture.debugElement.query(By.css('.emerald-card-grid'));
      expect(cardGridElement.nativeElement.classList).toContain('emerald-card-grid--netflix');
    });
  });

  describe('Interactions', () => {
    it('should emit itemClick event when an item is clicked', () => {
      spyOn(hostComponent, 'onItemClick');
      
      const firstItem = hostFixture.debugElement.query(By.css('.mock-item[data-id="1"]'));
      firstItem.nativeElement.click();
      
      expect(hostComponent.onItemClick).toHaveBeenCalledWith(hostComponent.items[0]);
    });
  });

  describe('Empty State', () => {
    it('should not render any items when items array is empty', () => {
      hostComponent.items = [];
      hostFixture.detectChanges();
      
      const itemElements = hostFixture.debugElement.queryAll(By.css('.mock-item'));
      expect(itemElements.length).toBe(0);
    });
  });
});