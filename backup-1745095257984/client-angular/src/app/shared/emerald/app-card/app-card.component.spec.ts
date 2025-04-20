// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the Emerald AppCard component
//
// COMMON CUSTOMIZATIONS:
// - MOCK_ITEM: Mock item data for testing
// ===================================================
import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { By } from '@angular/platform-browser';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppCardComponent } from './app-card.component';
import { LabelComponent } from '../components/label/label.component';

/**
 * Custom HTML template for testing to avoid using the shared template
 * that requires methods not available in this component
 */
@Component({
  selector: 'emerald-app-card-test',
  template: `
    <div class="emerald-app-card" [ngClass]="'emerald-app-card--' + layout">
      <div class="emerald-app-card__content">
        <h3 class="emerald-app-card__title">{{ title }}</h3>
        <p class="emerald-app-card__subtitle" *ngIf="subtitle">{{ subtitle }}</p>
        <p class="emerald-app-card__description" *ngIf="description">{{ description }}</p>
        <div class="emerald-app-card__tags" *ngIf="visibleTags.length > 0">
          <emerald-label *ngFor="let tag of visibleTags" [text]="tag"></emerald-label>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, LabelComponent],
})
class TestAppCardComponent extends AppCardComponent {}

describe('AppCardComponent (Basic Version)', () => {
  let component: TestAppCardComponent;
  let fixture: ComponentFixture<TestAppCardComponent>;
  // let debugElement: DebugElement;

  // Mock item data for testing
  const mockItem = {
    id: 'item123',
    title: 'Test Item',
    subtitle: 'Test Subtitle',
    description: 'This is a test item description',
    imageUrl: 'https://example.com/image1.jpg',
    avatarUrl: 'https://example.com/avatar1.jpg',
    avatarName: 'Test User',
    isOnline: true,
    tags: ['tag1', 'tag2', 'tag3', 'tag4'],
    actions: [
      { id: 'action1', icon: 'heart', tooltip: 'Like' },
      { id: 'action2', icon: 'comment', tooltip: 'Comment' },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, TestAppCardComponent, LabelComponent],
      schemas: [NO_ERRORS_SCHEMA], // Ignore unknown elements/attributes
    }).compileComponents();

    fixture = TestBed.createComponent(TestAppCardComponent);
    component = fixture.componentInstance;
    // debugElement = fixture.debugElement;

    // Set the mock item data
    component.title = mockItem.title;
    component.subtitle = mockItem.subtitle;
    component.description = mockItem.description;
    component.imageUrl = mockItem.imageUrl;
    component.avatarUrl = mockItem.avatarUrl;
    component.avatarName = mockItem.avatarName;
    component.isOnline = mockItem.isOnline;
    component.tags = mockItem.tags;
    component.itemId = mockItem.id;
    component.actions = mockItem.actions;

    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      const newComponent = new AppCardComponent();
      expect(newComponent.layout).toBe('default');
      expect(newComponent.title).toBe('');
      expect(newComponent.subtitle).toBe('');
      expect(newComponent.description).toBe('');
      expect(newComponent.imageUrl).toBe('');
      expect(newComponent.avatarUrl).toBe('');
      expect(newComponent.avatarName).toBe('');
      expect(newComponent.isOnline).toBeFalse();
      expect(newComponent.tags).toEqual([]);
      expect(newComponent.maxTags).toBe(3);
      expect(newComponent.itemId).toBe('');
      expect(newComponent.actions).toEqual([]);
    });
  });

  describe('Event Handling', () => {
    it('should emit click event when card is clicked', () => {
      spyOn(component.click, 'emit');

      component.handleClick();

      expect(component.click.emit).toHaveBeenCalledWith(mockItem.id);
    });

    it('should emit actionClick event when an action is clicked', () => {
      spyOn(component.actionClick, 'emit');
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      component.handleActionClick(event, 'action1');

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.actionClick.emit).toHaveBeenCalledWith({
        id: 'action1',
        itemId: mockItem.id,
      });
    });
  });

  describe('Tag Handling', () => {
    it('should limit visible tags based on maxTags property', () => {
      component.maxTags = 2;
      fixture.detectChanges();

      expect(component.visibleTags.length).toBe(2);
      expect(component.visibleTags).toEqual(['tag1', 'tag2']);
    });

    it('should show all tags when maxTags is greater than tags length', () => {
      component.maxTags = 10;
      fixture.detectChanges();

      expect(component.visibleTags.length).toBe(mockItem.tags.length);
      expect(component.visibleTags).toEqual(mockItem.tags);
    });
  });
});
