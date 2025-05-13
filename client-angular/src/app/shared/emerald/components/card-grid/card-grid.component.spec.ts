// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (card-grid.component.spec)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, DebugElement, Input, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardGridComponent } from './card-grid.component';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';

// Mock component for nb-card
@Component({
  selector: 'nb-card',
  template: '<div class="mock-card">{{ title }}</div>',
  standalone: true,
  imports: [CommonModule],
})
class MockAppCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() description = '';
  @Input() imageUrl = '';
  @Input() avatarUrl = '';
  @Input() avatarName = '';
  @Input() isOnline = false;
  @Input() tags: string[] = [];
  @Input() actions: any[] = [];
  @Input() itemId = '';
  @Input() layout = '';
}

// Test host component with template reference
@Component({
  template: `
    <ng-template #customTemplate let-item>
      <div class="custom-template">{{ item.title }}</div>
    </ng-template>

    <nb-card-grid
      [items]="items"
      [columns]="columns"
      [gap]="gap"
      [minItemWidth]="minItemWidth"
      [loading]="loading"
      [skeletonCount]="skeletonCount"
      [animated]="animated"
      [layout]="layout"
      [itemTemplate]="useCustomTemplate ? customTemplate : null"
      (itemClick)="onItemClick($event)"
    >
    </nb-card-grid>
  `,
  standalone: true,
  imports: [CommonModule, CardGridComponent],
})
class TestHostComponent {
  @ViewChild('customTemplate') customTemplate!: TemplateRef<any>;

  items: any[] = [
    { id: '1', title: 'Item 1', description: 'Description 1' },
    { id: '2', title: 'Item 2', description: 'Description 2' },
    { id: '3', title: 'Item 3', description: 'Description 3' },
  ];
  columns: number | null = null;
  gap = 16;
  minItemWidth = 280;
  loading = false;
  skeletonCount = 6;
  animated = true;
  layout: 'grid' | 'masonry' | 'netflix' = 'grid';
  useCustomTemplate = false;

  clickedItem: any = null;

  onItemClick(item: any): void {
    this.clickedItem = item;
  }
}

describe('CardGridComponent', () => {
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        CardGridComponent,
        MockAppCardComponent,
        SkeletonLoaderComponent,
        TestHostComponent,
      ],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    debugElement = hostFixture.debugElement;
    hostFixture.detectChanges();
  });

  it('should create', () => {
    expect(hostComponent).toBeTruthy();
    const cardGridComponent = debugElement.query(By.directive(CardGridComponent));
    expect(cardGridComponent).toBeTruthy();
  });

  it('should initialize with default values', () => {
    const cardGridComponent = debugElement.query(By.directive(CardGridComponent)).componentInstance;
    expect(cardGridComponent.items.length).toBe(3);
    expect(cardGridComponent.columns).toBeNull();
    expect(cardGridComponent.gap).toBe(16);
    expect(cardGridComponent.minItemWidth).toBe(280);
    expect(cardGridComponent.loading).toBeFalse();
    expect(cardGridComponent.skeletonCount).toBe(6);
    expect(cardGridComponent.animated).toBeTrue();
    expect(cardGridComponent.layout).toBe('grid');
  });

  it('should render grid layout correctly', () => {
    hostComponent.layout = 'grid';
    hostFixture.detectChanges();

    const gridElement = debugElement.query(By.css('.nb-card-grid'));
    expect(gridElement).toBeTruthy();

    // Check if the grid style is applied correctly
    const gridStyles = gridElement.styles;
    expect(gridStyles['display']).toBe('grid');
    expect(gridStyles['grid-template-columns']).toContain('minmax');
    expect(gridStyles['gap']).toBe('16px');
  });

  it('should render masonry layout correctly', () => {
    hostComponent.layout = 'masonry';
    hostFixture.detectChanges();

    const gridElement = debugElement.query(By.css('.nb-card-grid'));
    expect(gridElement).toBeTruthy();
    expect(gridElement.classes['nb-card-grid--masonry']).toBeTrue();

    // Check if masonry items have the correct class
    const masonryItems = debugElement.queryAll(By.css('.nb-card-grid__item--masonry'));
    expect(masonryItems.length).toBe(3);
  });

  it('should render netflix layout correctly', () => {
    hostComponent.layout = 'netflix';
    hostFixture.detectChanges();

    const netflixGrid = debugElement.query(By.css('.nb-card-grid--netflix'));
    expect(netflixGrid).toBeTruthy();

    const netflixRow = debugElement.query(By.css('.nb-card-grid__netflix-row'));
    expect(netflixRow).toBeTruthy();

    const netflixItems = debugElement.queryAll(By.css('.nb-card-grid__item--netflix'));
    expect(netflixItems.length).toBe(3);
  });

  it('should handle item click event', () => {
    // Find the first grid item
    const firstItem = debugElement.query(By.css('.nb-card-grid__item'));
    expect(firstItem).toBeTruthy();

    // Trigger click event
    firstItem.triggerEventHandler('click', null);
    hostFixture.detectChanges();

    // Check if the clicked item is correctly captured
    expect(hostComponent.clickedItem).toBeTruthy();
    expect(hostComponent.clickedItem.id).toBe('1');
  });

  it('should display loading skeletons', () => {
    hostComponent.loading = true;
    hostFixture.detectChanges();

    // Check if skeleton loaders are displayed
    const skeletonLoaders = debugElement.queryAll(By.directive(SkeletonLoaderComponent));
    expect(skeletonLoaders.length).toBe(6); // Default skeletonCount is 6

    // Change skeleton count
    hostComponent.skeletonCount = 3;
    hostFixture.detectChanges();

    const updatedSkeletonLoaders = debugElement.queryAll(By.directive(SkeletonLoaderComponent));
    expect(updatedSkeletonLoaders.length).toBe(3);
  });

  it('should use custom item template', () => {
    hostComponent.useCustomTemplate = true;
    hostFixture.detectChanges();

    // Check if custom template is used
    const customTemplateElements = debugElement.queryAll(By.css('.custom-template'));
    expect(customTemplateElements.length).toBe(3);

    // Verify content
    expect(customTemplateElements[0].nativeElement.textContent).toContain('Item 1');
    expect(customTemplateElements[1].nativeElement.textContent).toContain('Item 2');
    expect(customTemplateElements[2].nativeElement.textContent).toContain('Item 3');
  });

  it('should handle empty items array', () => {
    hostComponent.items = [];
    hostFixture.detectChanges();

    // Check if empty state is displayed
    const emptyState = debugElement.query(By.css('.nb-card-grid__empty'));
    expect(emptyState).toBeTruthy();

    // Verify empty state content
    expect(emptyState.nativeElement.textContent).toContain('No items found');
  });
});
