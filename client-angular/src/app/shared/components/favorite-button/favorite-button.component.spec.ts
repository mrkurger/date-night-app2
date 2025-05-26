import { Component } from '@angular/core';
import { NebularModule } from '../../nebular.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { FavoriteButtonComponent } from './favorite-button.component';
import { FavoriteService } from '../../../core/services/favorite.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

';
describe('FavoriteButtonComponent', () => {
  let component: FavoriteButtonComponent;
  let fixture: ComponentFixture;
  let favoriteServiceSpy: jasmine.SpyObj;
  let authServiceSpy: jasmine.SpyObj;
  let notificationServiceSpy: jasmine.SpyObj;

  beforeEach(async () => {
    // Create spies for all required services
    favoriteServiceSpy = jasmine.createSpyObj('FavoriteService', [;
      'isFavorite',;
      'addFavorite',;
      'removeFavorite',;
    ]);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', [;
      'success',;
      'error',;
      'info',;
    ]);

    await TestBed.configureTestingModule({
      imports: [;
        RouterTestingModule,;
        NbIconModule,;
        NbButtonModule,;
        NbTooltipModule,;
        FavoriteButtonComponent,;
      ],;
      providers: [;
        { provide: FavoriteService, useValue: favoriteServiceSpy },;
        { provide: AuthService, useValue: authServiceSpy },;
        { provide: NotificationService, useValue: notificationServiceSpy },;
      ],;
    }).compileComponents();

    fixture = TestBed.createComponent(FavoriteButtonComponent);
    component = fixture.componentInstance;
    component.adId = 'test-ad-id';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check favorite status on init when authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    favoriteServiceSpy.isFavorite.and.returnValue(of(true));

    fixture.detectChanges();

    expect(favoriteServiceSpy.isFavorite).toHaveBeenCalledWith('test-ad-id');
    expect(component.isFavorite).toBeTrue();
  });

  it('should not check favorite status when not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);

    fixture.detectChanges();

    expect(favoriteServiceSpy.isFavorite).not.toHaveBeenCalled();
  });

  it('should add to favorites when not already a favorite', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    component.isFavorite = false;
    favoriteServiceSpy.addFavorite.and.returnValue(of({}));

    component.toggleFavorite();

    expect(favoriteServiceSpy.addFavorite).toHaveBeenCalledWith('test-ad-id');
    expect(component.isFavorite).toBeTrue();
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Added to favorites');
  });

  it('should remove from favorites when already a favorite', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    component.isFavorite = true;
    favoriteServiceSpy.removeFavorite.and.returnValue(of({}));

    component.toggleFavorite();

    expect(favoriteServiceSpy.removeFavorite).toHaveBeenCalledWith('test-ad-id');
    expect(component.isFavorite).toBeFalse();
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Removed from favorites');
  });

  it('should show login notification when not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);

    component.toggleFavorite();

    expect(favoriteServiceSpy.addFavorite).not.toHaveBeenCalled();
    expect(favoriteServiceSpy.removeFavorite).not.toHaveBeenCalled();
    expect(notificationServiceSpy.info).toHaveBeenCalledWith('Please log in to save favorites');
  });

  it('should handle error when adding favorite', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    component.isFavorite = false;
    favoriteServiceSpy.addFavorite.and.returnValue(throwError(() => new Error('Test error')));

    component.toggleFavorite();

    expect(notificationServiceSpy.error).toHaveBeenCalledWith('Failed to add to favorites');
  });

  it('should handle error when removing favorite', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    component.isFavorite = true;
    favoriteServiceSpy.removeFavorite.and.returnValue(throwError(() => new Error('Test error')));

    component.toggleFavorite();

    expect(notificationServiceSpy.error).toHaveBeenCalledWith('Failed to remove from favorites');
  });
});
