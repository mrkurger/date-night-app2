// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the preferences demo component
//
// COMMON CUSTOMIZATIONS:
// - MOCK_PREFERENCES: Mock user preferences for testing (default: see below)
//   Related to: user-preferences.service.ts:DEFAULT_PREFERENCES
// ===================================================

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreferencesDemoComponent } from './preferences-demo.component';
import { UserPreferencesService } from '../../core/services/user-preferences.service';
import { BehaviorSubject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('PreferencesDemoComponent', () => {
  let component: PreferencesDemoComponent;
  let fixture: ComponentFixture<PreferencesDemoComponent>;
  let mockUserPreferencesService: jasmine.SpyObj<UserPreferencesService>;
  let preferencesSubject: BehaviorSubject<any>;

  const MOCK_PREFERENCES: any = {
    defaultViewType: 'netflix' as 'netflix' | 'tinder' | 'list',
    contentDensity: 'comfortable',
    cardSize: 'medium',
    savedFilters: {},
    recentlyViewed: [],
    favorites: [],
  };

  beforeEach(async () => {
    // Create a mock preferences subject
    preferencesSubject = new BehaviorSubject(MOCK_PREFERENCES);

    // Create a mock UserPreferencesService
    mockUserPreferencesService = jasmine.createSpyObj('UserPreferencesService', [
      'getPreferences',
      'setDefaultViewType',
      'setContentDensity',
      'setCardSize',
      'resetPreferences',
    ]);

    // Configure the mock service
    mockUserPreferencesService.getPreferences.and.returnValue(MOCK_PREFERENCES);
    mockUserPreferencesService.preferences$ = preferencesSubject.asObservable();

    // Create getters for the options
    Object.defineProperty(mockUserPreferencesService, 'contentDensityOptions', {
      get: () => [
        { value: 'comfortable', label: 'Comfortable' },
        { value: 'compact', label: 'Compact' },
        { value: 'condensed', label: 'Condensed' },
      ],
    });

    Object.defineProperty(mockUserPreferencesService, 'cardSizeOptions', {
      get: () => [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
      ],
    });

    await TestBed.configureTestingModule({
      imports: [PreferencesDemoComponent],
      providers: [{ provide: UserPreferencesService, useValue: mockUserPreferencesService }],
      schemas: [NO_ERRORS_SCHEMA], // Ignore unknown elements like mat-card
    }).compileComponents();

    fixture = TestBed.createComponent(PreferencesDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load initial preferences', () => {
    expect(component.defaultViewType).toBe('netflix');
    expect(component.contentDensity).toBe('comfortable');
    expect(component.cardSize).toBe('medium');
    expect(mockUserPreferencesService.getPreferences).toHaveBeenCalled();
  });

  it('should update when preferences change', () => {
    // Simulate a preference change
    preferencesSubject.next({
      ...MOCK_PREFERENCES,
      defaultViewType: 'tinder',
      contentDensity: 'compact',
      cardSize: 'large',
    });

    // Check that the component updated
    expect(component.defaultViewType).toBe('tinder');
    expect(component.contentDensity).toBe('compact');
    expect(component.cardSize).toBe('large');
  });

  it('should call setDefaultViewType when view type changes', () => {
    // Arrange
    component.defaultViewType = 'tinder';

    // Act
    component.onViewTypeChange();

    // Assert
    expect(mockUserPreferencesService.setDefaultViewType).toHaveBeenCalledWith('tinder');
  });

  it('should call setContentDensity when content density changes', () => {
    // Arrange
    component.contentDensity = 'compact';

    // Act
    component.onContentDensityChange();

    // Assert
    expect(mockUserPreferencesService.setContentDensity).toHaveBeenCalledWith('compact');
  });

  it('should call setCardSize when card size changes', () => {
    // Arrange
    component.cardSize = 'large';

    // Act
    component.onCardSizeChange();

    // Assert
    expect(mockUserPreferencesService.setCardSize).toHaveBeenCalledWith('large');
  });

  it('should call resetPreferences when reset is clicked', () => {
    // Act
    component.resetPreferences();

    // Assert
    expect(mockUserPreferencesService.resetPreferences).toHaveBeenCalled();
  });

  it('should get content density label', () => {
    // Arrange
    component.contentDensity = 'compact';

    // Act
    const label = component.getContentDensityLabel();

    // Assert
    expect(label).toBe('Compact');
  });

  it('should get card size label', () => {
    // Arrange
    component.cardSize = 'large';

    // Act
    const label = component.getCardSizeLabel();

    // Assert
    expect(label).toBe('Large');
  });
});
