import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { By } from '@angular/platform-browser';

import { AppCardComponent } from './app-card.component';

// Mock LabelComponent for testing
@Component({
  selector: 'emerald-label',
  template: '<div class="mock-label">{{ text }}</div>'
})
class MockLabelComponent {
  @Input() text: string = '';
  @Input() color: string = 'primary';
  @Input() size: string = 'medium';
}

describe('AppCardComponent', () => {
  let component: AppCardComponent;
  let fixture: ComponentFixture<AppCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MockLabelComponent],
      imports: [AppCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AppCardComponent);
    component = fixture.componentInstance;
    
    // Set default inputs
    component.title = 'Test Card';
    component.subtitle = 'Test Subtitle';
    component.description = 'Test Description';
    component.imageUrl = '/assets/images/test-image.jpg';
    component.itemId = 'test-id';
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Basic Rendering', () => {
    it('should render title correctly', () => {
      const titleElement = fixture.debugElement.query(By.css('.emerald-app-card__title'));
      expect(titleElement.nativeElement.textContent).toContain('Test Card');
    });

    it('should render subtitle correctly', () => {
      const subtitleElement = fixture.debugElement.query(By.css('.emerald-app-card__subtitle'));
      expect(subtitleElement.nativeElement.textContent).toContain('Test Subtitle');
    });

    it('should render description correctly', () => {
      const descriptionElement = fixture.debugElement.query(By.css('.emerald-app-card__description'));
      expect(descriptionElement.nativeElement.textContent).toContain('Test Description');
    });

    it('should set background image correctly', () => {
      const cardElement = fixture.debugElement.query(By.css('.emerald-app-card__image'));
      expect(cardElement.nativeElement.style.backgroundImage).toContain('test-image.jpg');
    });
  });

  describe('Layout Variations', () => {
    it('should apply default layout class', () => {
      const cardElement = fixture.debugElement.query(By.css('.emerald-app-card'));
      expect(cardElement.nativeElement.classList).toContain('emerald-app-card--default');
    });

    it('should apply netflix layout class when specified', () => {
      component.layout = 'netflix';
      fixture.detectChanges();
      
      const cardElement = fixture.debugElement.query(By.css('.emerald-app-card'));
      expect(cardElement.nativeElement.classList).toContain('emerald-app-card--netflix');
    });

    it('should apply tinder layout class when specified', () => {
      component.layout = 'tinder';
      fixture.detectChanges();
      
      const cardElement = fixture.debugElement.query(By.css('.emerald-app-card'));
      expect(cardElement.nativeElement.classList).toContain('emerald-app-card--tinder');
    });
  });

  describe('Avatar Rendering', () => {
    it('should not show avatar by default', () => {
      const avatarElement = fixture.debugElement.query(By.css('.emerald-app-card__avatar'));
      expect(avatarElement).toBeNull();
    });

    it('should show avatar when avatarUrl is provided', () => {
      component.avatarUrl = '/assets/images/avatar.jpg';
      component.avatarName = 'Test User';
      fixture.detectChanges();
      
      const avatarElement = fixture.debugElement.query(By.css('.emerald-app-card__avatar'));
      expect(avatarElement).toBeTruthy();
      expect(avatarElement.nativeElement.style.backgroundImage).toContain('avatar.jpg');
    });

    it('should show online indicator when isOnline is true', () => {
      component.avatarUrl = '/assets/images/avatar.jpg';
      component.avatarName = 'Test User';
      component.isOnline = true;
      fixture.detectChanges();
      
      const onlineIndicator = fixture.debugElement.query(By.css('.emerald-app-card__online-indicator'));
      expect(onlineIndicator).toBeTruthy();
    });
  });

  describe('Tags Rendering', () => {
    it('should not show tags by default', () => {
      const tagsContainer = fixture.debugElement.query(By.css('.emerald-app-card__tags'));
      expect(tagsContainer).toBeNull();
    });

    it('should show tags when provided', () => {
      component.tags = ['Tag1', 'Tag2', 'Tag3'];
      fixture.detectChanges();
      
      const tagsContainer = fixture.debugElement.query(By.css('.emerald-app-card__tags'));
      expect(tagsContainer).toBeTruthy();
      
      const tagElements = fixture.debugElement.queryAll(By.css('emerald-label'));
      expect(tagElements.length).toBe(3);
    });

    it('should limit tags to 3 by default', () => {
      component.tags = ['Tag1', 'Tag2', 'Tag3', 'Tag4', 'Tag5'];
      fixture.detectChanges();
      
      const tagElements = fixture.debugElement.queryAll(By.css('emerald-label'));
      expect(tagElements.length).toBe(3);
    });
  });

  describe('Actions', () => {
    it('should emit actionClick event when action button is clicked', () => {
      component.actions = [
        { id: 'view', icon: 'fas fa-info-circle', tooltip: 'View Details' }
      ];
      fixture.detectChanges();
      
      spyOn(component.actionClick, 'emit');
      
      const actionButton = fixture.debugElement.query(By.css('.emerald-app-card__action-button'));
      actionButton.nativeElement.click();
      
      expect(component.actionClick.emit).toHaveBeenCalledWith({
        id: 'view',
        itemId: 'test-id'
      });
    });

    it('should render multiple action buttons when multiple actions are provided', () => {
      component.actions = [
        { id: 'view', icon: 'fas fa-info-circle', tooltip: 'View Details' },
        { id: 'favorite', icon: 'fas fa-heart', tooltip: 'Add to Favorites' },
        { id: 'chat', icon: 'fas fa-comment', tooltip: 'Start Chat' }
      ];
      fixture.detectChanges();
      
      const actionButtons = fixture.debugElement.queryAll(By.css('.emerald-app-card__action-button'));
      expect(actionButtons.length).toBe(3);
    });
  });

  describe('Card Click', () => {
    it('should emit click event when card is clicked', () => {
      spyOn(component.click, 'emit');
      
      const cardElement = fixture.debugElement.query(By.css('.emerald-app-card'));
      cardElement.nativeElement.click();
      
      expect(component.click.emit).toHaveBeenCalledWith('test-id');
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate ARIA attributes', () => {
      const cardElement = fixture.debugElement.query(By.css('.emerald-app-card'));
      expect(cardElement.nativeElement.getAttribute('role')).toBe('button');
      expect(cardElement.nativeElement.getAttribute('tabindex')).toBe('0');
      expect(cardElement.nativeElement.getAttribute('aria-label')).toContain('Test Card');
    });

    it('should have tooltips on action buttons', () => {
      component.actions = [
        { id: 'view', icon: 'fas fa-info-circle', tooltip: 'View Details' }
      ];
      fixture.detectChanges();
      
      const actionButton = fixture.debugElement.query(By.css('.emerald-app-card__action-button'));
      expect(actionButton.nativeElement.getAttribute('title')).toBe('View Details');
    });
  });
});