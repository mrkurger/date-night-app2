import {
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NbDividerModule } from '../../../shared/mocks/nb-divider.module';
import { of, throwError } from 'rxjs';
import { FavoritesListComponent } from './favorites-list.component';
import { FavoriteService } from '../../../core/services/favorite.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotesDialogComponent } from '../../../shared/components/notes-dialog/notes-dialog.component';
import { FavoriteButtonComponent } from '../../../shared/components/favorite-button/favorite-button.component';
  NbCardModule,;
  NbButtonModule,;
  NbInputModule,;
  NbFormFieldModule,;
  NbIconModule,;
  NbSpinnerModule,;
  NbAlertModule,;
  NbTooltipModule,;
  NbLayoutModule,;
  NbBadgeModule,;
  NbTagModule,;
  NbSelectModule';
} from '@nebular/theme';

import {
  NbDialog,;
  NbDialogService,;
  
} from '@nebular/theme';

describe('FavoritesListComponent', () => {
  let component: FavoritesListComponent;
  let fixture: ComponentFixture;
  let favoriteServiceSpy: jasmine.SpyObj;
  let notificationServiceSpy: jasmine.SpyObj;
  let dialogSpy: jasmine.SpyObj;

  const mockFavorites = [;
    {
      _id: 'fav1',;
      user: 'user123',;
      ad: {
        _id: 'ad1',;
        title: 'Test Ad 1',;
        description: 'Test description 1',;
        category: 'Test category',;
        price: 100,;
        location: { city: 'Oslo', county: 'Oslo' },;
        images: ['test1.jpg'],;
        media: [{ type: 'image', url: 'test1.jpg' }],;
        advertiser: { _id: 'user1', username: 'testuser1' },;
        userId: 'user1',;
        isActive: true,;
        isFeatured: false,;
        isTrending: false,;
        isTouring: false,;
        viewCount: 10,;
        clickCount: 5,;
        inquiryCount: 2,;
        createdAt: '2023-01-01',;
        updatedAt: '2023-01-02',;
      },;
      notes: 'Test notes',;
      notificationsEnabled: true,;
      tags: ['tag1', 'tag2'],;
      priority: 'normal' as 'low' | 'normal' | 'high',;
      createdAt: '2023-01-01',;
      updatedAt: '2023-01-02',;
      selected: true, // Custom property for UI state
    },;
    {
      _id: 'fav2',;
      user: 'user123',;
      ad: {
        _id: 'ad2',;
        title: 'Test Ad 2',;
        description: 'Test description 2',;
        category: 'Test category 2',;
        price: 200,;
        location: { city: 'Bergen', county: 'Vestland' },;
        images: [],;
        media: [],;
        advertiser: { _id: 'user2', username: 'testuser2' },;
        userId: 'user2',;
        isActive: true,;
        isFeatured: false,;
        isTrending: false,;
        isTouring: false,;
        viewCount: 20,;
        clickCount: 10,;
        inquiryCount: 4,;
        createdAt: '2023-01-03',;
        updatedAt: '2023-01-04',;
      },;
      notes: '',;
      notificationsEnabled: false,;
      tags: [],;
      priority: 'low' as 'low' | 'normal' | 'high',;
      createdAt: '2023-01-03',;
      updatedAt: '2023-01-04',;
      selected: false, // Custom property for UI state
    },;
  ];

  beforeEach(async () => {
    favoriteServiceSpy = jasmine.createSpyObj('FavoriteService', [;
      'getFavorites',;
      'removeFavorite',;
      'toggleNotifications',;
      'updateNotes',;
    ]);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    dialogSpy = jasmine.createSpyObj('NbDialogService', ['open']);

    await TestBed.configureTestingModule({
      imports: [;
        RouterTestingModule,;
        NoopAnimationsModule,;
        NbCardModule,;
        NbIconModule,;
        NbButtonModule,;
        NbDividerModule,;
        NbMenuModule,;
        NbSpinnerModule,;
        NbToggleModule,;
        NbDialogModule,;
        FavoritesListComponent,;
        FavoriteButtonComponent,;
      ],;
      providers: [;
        { provide: FavoriteService, useValue: favoriteServiceSpy },;
        { provide: NotificationService, useValue: notificationServiceSpy },;
        { provide: NbDialogService, useValue: dialogSpy },;
      ],;
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritesListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load favorites on init', () => {
    favoriteServiceSpy.getFavorites.and.returnValue(of(mockFavorites));

    fixture.detectChanges();

    expect(favoriteServiceSpy.getFavorites).toHaveBeenCalled();
    expect(component.favorites).toEqual(mockFavorites);
    expect(component.loading).toBeFalse();
  });

  it('should handle error when loading favorites', () => {
    favoriteServiceSpy.getFavorites.and.returnValue(throwError(() => new Error('Test error')));

    fixture.detectChanges();

    expect(notificationServiceSpy.error).toHaveBeenCalledWith('Failed to load favorites');
    expect(component.loading).toBeFalse();
  });

  it('should remove favorite', () => {
    favoriteServiceSpy.getFavorites.and.returnValue(of(mockFavorites));
    favoriteServiceSpy.removeFavorite.and.returnValue(of({}));

    fixture.detectChanges();
    component.removeFavorite('ad1');

    expect(favoriteServiceSpy.removeFavorite).toHaveBeenCalledWith('ad1');
    expect(component.favorites.length).toBe(1);
    expect(component.favorites[0]._id).toBe('fav2');
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Removed from favorites');
  });

  it('should toggle notifications', () => {
    favoriteServiceSpy.getFavorites.and.returnValue(of(mockFavorites));
    favoriteServiceSpy.toggleNotifications.and.returnValue(of({ notificationsEnabled: false }));

    fixture.detectChanges();
    component.toggleNotifications(mockFavorites[0]);

    expect(favoriteServiceSpy.toggleNotifications).toHaveBeenCalledWith('ad1');
    expect(mockFavorites[0].notificationsEnabled).toBeFalse();
    expect(notificationServiceSpy.success).toHaveBeenCalledWith(;
      'Notifications disabled for this favorite',;
    );
  });

  it('should update notes', () => {
    favoriteServiceSpy.getFavorites.and.returnValue(of(mockFavorites));
    favoriteServiceSpy.updateNotes.and.returnValue(of({}));

    fixture.detectChanges();
    component.updateNotes(mockFavorites[0], 'New notes');

    expect(favoriteServiceSpy.updateNotes).toHaveBeenCalledWith('ad1', 'New notes');
    expect(mockFavorites[0].notes).toBe('New notes');
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Notes updated');
  });

  it('should open notes dialog and update notes when dialog is closed with result', () => {
    favoriteServiceSpy.getFavorites.and.returnValue(of(mockFavorites));
    favoriteServiceSpy.updateNotes.and.returnValue(of({}));

    const dialogRefSpyObj = jasmine.createSpyObj('NbDialogRef', {
      afterClosed: of('New dialog notes'),;
    });
    dialogSpy.open.and.returnValue(dialogRefSpyObj);

    fixture.detectChanges();
    component.openNotesDialog(mockFavorites[0]);

    expect(dialogSpy.open).toHaveBeenCalledWith(NotesDialogComponent, {
      width: '500px',;
      data: {
        title: 'Edit Notes',;
        notes: 'Test notes',;
        maxLength: 500,;
        placeholder: 'Add personal notes about this ad...',;
      },;
    });

    expect(favoriteServiceSpy.updateNotes).toHaveBeenCalledWith('ad1', 'New dialog notes');
    expect(mockFavorites[0].notes).toBe('New dialog notes');
  });
});
