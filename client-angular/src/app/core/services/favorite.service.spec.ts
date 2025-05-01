import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FavoriteService } from './favorite.service';
import { environment } from '../../../environments/environment';

describe('FavoriteService', () => {
  let service: FavoriteService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/favorites`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FavoriteService],
    });
    service = TestBed.inject(FavoriteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadFavoriteIds', () => {
    it('should load favorite IDs and update the subject', () => {
      const mockIds = ['id1', 'id2', 'id3'];
      let result: string[] | undefined;

      service.loadFavoriteIds().subscribe(ids => {
        result = ids;
      });

      const req = httpMock.expectOne(`${apiUrl}/ids`);
      expect(req.request.method).toBe('GET');
      req.flush(mockIds);

      expect(result).toEqual(mockIds);

      // Check that the subject was updated
      service.favorites$.subscribe(ids => {
        expect(ids).toEqual(mockIds);
      });
    });
  });

  describe('getFavorites', () => {
    it('should return favorites', () => {
      const mockFavorites = [
        {
          _id: '1',
          user: 'user1',
          ad: {
            _id: 'ad1',
            title: 'Ad 1',
            userId: 'user1',
            isActive: true,
            isFeatured: false,
            isTrending: false,
            isTouring: false,
            viewCount: 0,
            clickCount: 0,
            inquiryCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            location: {
              city: 'Test City',
              county: 'Test County',
            },
          },
          notificationsEnabled: false,
          tags: [],
          priority: 'normal',
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: '2',
          user: 'user1',
          ad: {
            _id: 'ad2',
            title: 'Ad 2',
            userId: 'user1',
            isActive: true,
            isFeatured: false,
            isTrending: false,
            isTouring: false,
            viewCount: 0,
            clickCount: 0,
            inquiryCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            location: {
              city: 'Test City',
              county: 'Test County',
            },
          },
          notificationsEnabled: false,
          tags: [],
          priority: 'normal',
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      service.getFavorites().subscribe(favorites => {
        expect(favorites.length).toEqual(mockFavorites.length);
        expect(favorites[0]._id).toEqual(mockFavorites[0]._id);
        expect(favorites[1]._id).toEqual(mockFavorites[1]._id);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockFavorites);
    });
  });

  describe('isFavorite', () => {
    it('should check if ad is favorite from server when favorites not loaded', () => {
      const adId = 'ad1';
      const isFavorite = true;

      service.isFavorite(adId).subscribe(result => {
        expect(result).toBe(isFavorite);
      });

      const req = httpMock.expectOne(`${apiUrl}/check/${adId}`);
      expect(req.request.method).toBe('GET');
      req.flush(isFavorite);
    });

    it('should check if ad is favorite from cache when favorites loaded', () => {
      const mockIds = ['ad1', 'ad2', 'ad3'];
      const adId = 'ad1';

      // First load the favorites
      service.loadFavoriteIds().subscribe();
      const loadReq = httpMock.expectOne(`${apiUrl}/ids`);
      loadReq.flush(mockIds);

      // Then check if ad is favorite
      service.isFavorite(adId).subscribe(result => {
        expect(result).toBe(true);
      });

      // No HTTP request should be made
      httpMock.expectNone(`${apiUrl}/check/${adId}`);
    });
  });

  describe('addFavorite', () => {
    it('should add favorite and update the subject', () => {
      const adId = 'ad1';
      const notes = 'Test notes';
      const notificationsEnabled = true;
      const mockIds = ['ad2'];

      // First load the favorites
      service.loadFavoriteIds().subscribe();
      const loadReq = httpMock.expectOne(`${apiUrl}/ids`);
      loadReq.flush(mockIds);

      service.addFavorite(adId, notes, notificationsEnabled).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${adId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ notes, notificationsEnabled });
      req.flush({});

      // Check that the subject was updated
      service.favorites$.subscribe(ids => {
        expect(ids).toContain(adId);
        expect(ids.length).toBe(2);
      });
    });
  });

  describe('removeFavorite', () => {
    it('should remove favorite and update the subject', () => {
      const adId = 'ad1';
      const mockIds = ['ad1', 'ad2'];

      // First load the favorites
      service.loadFavoriteIds().subscribe();
      const loadReq = httpMock.expectOne(`${apiUrl}/ids`);
      loadReq.flush(mockIds);

      service.removeFavorite(adId).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${adId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});

      // Check that the subject was updated
      service.favorites$.subscribe(ids => {
        expect(ids).not.toContain(adId);
        expect(ids.length).toBe(1);
      });
    });
  });

  describe('updateNotes', () => {
    it('should update notes for a favorite', () => {
      const adId = 'ad1';
      const notes = 'Updated notes';

      service.updateNotes(adId, notes).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${adId}/notes`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ notes });
      req.flush({});
    });
  });

  describe('toggleNotifications', () => {
    it('should toggle notifications for a favorite', () => {
      const adId = 'ad1';

      service.toggleNotifications(adId).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${adId}/notifications`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush({});
    });
  });

  describe('clearCache', () => {
    it('should clear the cached favorites', () => {
      const mockIds = ['ad1', 'ad2'];

      // First load the favorites
      service.loadFavoriteIds().subscribe();
      const loadReq = httpMock.expectOne(`${apiUrl}/ids`);
      loadReq.flush(mockIds);

      // Check that favorites are loaded
      service.favorites$.subscribe(ids => {
        expect(ids).toEqual(mockIds);
      });

      // Clear the cache
      service.clearCache();

      // Check that favorites are cleared
      service.favorites$.subscribe(ids => {
        expect(ids).toEqual([]);
      });
    });
  });
});
