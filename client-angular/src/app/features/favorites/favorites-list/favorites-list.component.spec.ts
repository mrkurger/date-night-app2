import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { FavoritesListComponent } from './favorites-list.component';
import { FavoriteService } from '../../../core/services/favorite.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotesDialogComponent } from '../../../shared/components/notes-dialog/notes-dialog.component';
import { FavoriteButtonComponent } from '../../../shared/components/favorite-button/favorite-button.component';

describe('FavoritesListComponent', () => {
  let component: FavoritesListComponent;
  let fixture: ComponentFixture<FavoritesListComponent>;
  let favoriteServiceSpy: jasmine.SpyObj<FavoriteService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const mockFavorites = [
    {
      _id: 'fav1',
      ad: {
        _id: 'ad1',
        title: 'Test Ad 1',
        price: 100,
        location: { city: 'Oslo', county: 'Oslo' },
        images: [{ url: 'test1.jpg' }],
        advertiser: { _id: 'user1' },
      },
      notes: 'Test notes',
      notificationsEnabled: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'fav2',
      ad: {
        _id: 'ad2',
        title: 'Test Ad 2',
        price: 200,
        location: { city: 'Bergen', county: 'Vestland' },
        images: [],
        advertiser: { _id: 'user2' },
      },
      notes: '',
      notificationsEnabled: false,
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(async () => {
    favoriteServiceSpy = jasmine.createSpyObj('FavoriteService', [
      'getFavorites',
      'removeFavorite',
      'toggleNotifications',
      'updateNotes',
    ]);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NoopAnimationsModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatDividerModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatSlideToggleModule,
        MatDialogModule,
        FavoritesListComponent,
        FavoriteButtonComponent,
      ],
      providers: [
        { provide: FavoriteService, useValue: favoriteServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
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
    expect(notificationServiceSpy.success).toHaveBeenCalledWith(
      'Notifications disabled for this favorite'
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

    const dialogRefSpyObj = jasmine.createSpyObj('MatDialogRef', {
      afterClosed: of('New dialog notes'),
    });
    dialogSpy.open.and.returnValue(dialogRefSpyObj);

    fixture.detectChanges();
    component.openNotesDialog(mockFavorites[0]);

    expect(dialogSpy.open).toHaveBeenCalledWith(NotesDialogComponent, {
      width: '500px',
      data: {
        title: 'Edit Notes',
        notes: 'Test notes',
        maxLength: 500,
        placeholder: 'Add personal notes about this ad...',
      },
    });

    expect(favoriteServiceSpy.updateNotes).toHaveBeenCalledWith('ad1', 'New dialog notes');
    expect(mockFavorites[0].notes).toBe('New dialog notes');
  });
});
