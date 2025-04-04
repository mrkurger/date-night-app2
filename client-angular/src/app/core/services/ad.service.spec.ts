import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdService } from './ad.service';
import { environment } from '../../../environments/environment';

describe('AdService', () => {
  let service: AdService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdService]
    });

    service = TestBed.inject(AdService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch user ads', () => {
    const mockAds = [{ _id: '1', title: 'Test Ad' }];
    
    service.getUserAds('user1').subscribe(ads => {
      expect(ads).toEqual(mockAds);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ads/user/user1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAds);
  });
});
