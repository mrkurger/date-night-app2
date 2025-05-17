
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the /*DEPRECATED:Emerald*/ CardGrid component
//
// COMMON CUSTOMIZATIONS:
// - MOCK_ITEMS: Mock items data for testing
// ===================================================
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NebularModule } from '../../nebular.module';

// import { By } from '@angular/platform-browser';
import {
  // DebugElement, // Commented out as it's currently unused
  Component,
  NO_ERRORS_SCHEMA,
  ViewChild,
  TemplateRef,
} from '@angular/core';

import { CardGridComponent } from './card-grid.component';
import { SkeletonLoaderComponent } from '../components/skeleton-loader/skeleton-loader.component';
import { CommonTestModule, MockAppCardComponent } from '../../../testing/common-test.module';

// Test host component to test CardGridComponent in a realistic scenario
@Component({
  template: `
    <nb-card-grid
      [items]="items"
      [layout]="layout"
      [columns]="columns"
      [gap]="gap"
      [animated]="animated"
      [isLoading]="isLoading"
      (cardClick)="onCardClick($event)"
      (actionClick)="onActionClick($event)"
    >
      <ng-template #itemTemplate let-item>
        <div class="custom-item">{{ item.title }}</div>
      </ng-template>
    </nb-card-grid>
  `,
  standalone: true,
  imports: [CardGridComponent, CommonTestModule
    NbCardModule,],
})
class TestHostComponent {
  items = MOCK_ITEMS;
  layout: 'default' | 'compact' | 'masonry' = 'default';
  cardLayout: 'default' | 'netflix' | 'tinder' = 'default';
  columns = 4;
  gap = 16;
  animated = true;
  isLoading = false;

  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<unknown>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCardClick(_itemId: string): void {
    // Implementation not needed for test component
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onActionClick(_event: { id: string; itemId: string }): void {
    // Implementation not needed for test component
  }
}

// Mock items for testing
const MOCK_ITEMS = [
  {
    id: 'item1',
    title: 'Item 1',
    subtitle: 'Subtitle 1',
    description: 'Description for item 1',
    imageUrl: 'https://example.com/image1.jpg',
    avatarUrl: 'https://example.com/avatar1.jpg',
    avatarName: 'User 1',
    isOnline: true,
    tags: ['tag1', 'tag2'],
    actions: [
      { id: 'action1', icon: 'heart', tooltip: 'Like' },
      { id: 'action2', icon: 'comment', tooltip: 'Comment' },
    ],
  },
  {
    id: 'item2',
    title: 'Item 2',
    description: 'Description for item 2',
    imageUrl: 'https://example.com/image2.jpg',
    tags: ['tag3', 'tag4'],
  },
  {
    id: 'item3',
    title: 'Item 3',
    subtitle: 'Subtitle 3',
    imageUrl: 'https://example.com/image3.jpg',
  },
];

describe('CardGridComponent', () => {
  let component: CardGridComponent;
  let fixture: ComponentFixture<CardGridComponent>;
  // let debugElement: DebugElement;

  // let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonTestModule, CardGridComponent, MockAppCardComponent, TestHostComponent],
      schemas: [NO_ERRORS_SCHEMA], // Add this to ignore unknown properties
    })
      .overrideComponent(CardGridComponent, {
        set: {
          imports: [CommonTestModule, MockAppCardComponent, SkeletonLoaderComponent],
        },
      })
      .compileComponents();

    // Create the host component first
    hostFixture = TestBed.createComponent(TestHostComponent);
    // hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges(); // This is needed to initialize the ViewChild

    // Create the component directly
    fixture = TestBed.createComponent(CardGridComponent);
    component = fixture.componentInstance;
    // debugElement = fixture.debugElement;

    // Set default input values
    component.items = MOCK_ITEMS;

    // Allow actual rendering
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      const newComponent = new CardGridComponent();
      expect(newComponent.layout).toBe('default');
      expect(newComponent.cardLayout).toBe('default');
      expect(newComponent.columns).toBe(4);
      expect(newComponent.isLoading).toBeFalse();
      expect(newComponent.emptyStateMessage).toBe('No items to display');
      expect(newComponent.items).toEqual([]);
    });
  });

  describe('Event Handling', () => {
    it('should emit cardClick event when handleCardClick is called', () => {
      spyOn(component.cardClick, 'emit');

      component.handleCardClick('item1');

      expect(component.cardClick.emit).toHaveBeenCalledWith('item1');
    });

    it('should emit actionClick event when handleActionClick is called', () => {
      spyOn(component.actionClick, 'emit');
      const actionEvent = { id: 'action1', itemId: 'item1' };

      component.handleActionClick(actionEvent);

      expect(component.actionClick.emit).toHaveBeenCalledWith(actionEvent);
    });
  });
});
