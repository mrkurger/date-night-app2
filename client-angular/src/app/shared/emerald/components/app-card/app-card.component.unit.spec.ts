// ===================================================
// UNIT TESTS FOR APP CARD COMPONENT
// ===================================================
// This file contains unit tests for the AppCardComponent
//
// COMMON CUSTOMIZATIONS:
// - MOCK_AD: Mock ad data for testing
// - TEST_SCENARIOS: Test scenarios for component functionality
// ===================================================
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (app-card.component.unit.spec)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppCardComponent } from './app-card.component';
import { CommonModule } from '@angular/common';
import { Ad } from '../../../../core/models/ad.interface';

describe('AppCardComponent (Unit Tests)', () => {
  let component: AppCardComponent;
  let fixture: ComponentFixture<AppCardComponent>;

  // Mock ad data for testing
  const mockAd: Ad = {
    _id: 'ad123',
    title: 'Test Ad',
    description: 'This is a test ad description',
    category: 'test',
    price: 1234.56,
    location: { city: 'Test Location', county: 'Test County' },
    advertiser: 'Test Advertiser',
    isActive: true,
    isFeatured: false,
    isTrending: false,
    isTouring: false,
    viewCount: 0,
    clickCount: 0,
    inquiryCount: 0,
    tags: ['tag1', 'tag2', 'tag3'],
    media: [
      { url: 'https://example.com/image1.jpg', type: 'image' },
      { url: 'https://example.com/image2.jpg', type: 'image' },
    ],
    images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'user123',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, AppCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppCardComponent);
    component = fixture.componentInstance;
    component.ad = { ...mockAd };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test: Get primary image from ad
  it('should get primary image from ad', () => {
    // Test with media array
    component.ad = { ...mockAd };
    expect(component.getPrimaryImage()).toBe('https://example.com/image1.jpg');

    // Test with only images array
    component.ad = { ...mockAd, media: [] };
    expect(component.getPrimaryImage()).toBe('https://example.com/image1.jpg');

    // Test with no images
    component.ad = { ...mockAd, media: [], images: [] };
    expect(component.getPrimaryImage()).toBe('/assets/img/default-profile.jpg');
  });

  // Test: Get media count with media
  it('should get media count with media array', () => {
    component.ad = { ...mockAd };
    expect(component.getMediaCount()).toBe(2);
  });

  // Test: Get media count with images
  it('should get media count with images array', () => {
    component.ad = { ...mockAd, media: [] };
    expect(component.getMediaCount()).toBe(2);
  });

  // Test: Get media count with no media
  it('should return 0 for media count when no media or images', () => {
    component.ad = { ...mockAd, media: [], images: [] };
    expect(component.getMediaCount()).toBe(0);
  });

  // Test: Handle image loading error
  it('should handle image loading error', () => {
    const mockEvent = { target: { src: 'invalid-url' } } as unknown as Event;
    component.onImageError(mockEvent);

    expect((mockEvent.target as HTMLImageElement).src).toBe('/assets/img/default-profile.jpg');
  });

  // Test: Format price with decimals
  it('should format price with decimals', () => {
    expect(component.formatPrice(1234.56)).toBe('$1,235');
    expect(component.formatPrice(1000)).toBe('$1,000');
    expect(component.formatPrice(99.99)).toBe('$100');
  });

  // Test: Truncate long description
  it('should truncate long description', () => {
    const longDescription =
      'This is a very long description that should be truncated when displayed on the card.';
    component.ad = { ...mockAd, description: longDescription };

    expect(component.getTruncatedDescription(20)).toBe('This is a very long d...');
    expect(component.getTruncatedDescription(10)).toBe('This is a ...');
  });

  // Test: Handle empty description
  it('should handle empty description', () => {
    component.ad = { ...mockAd, description: '' };
    expect(component.getTruncatedDescription(20)).toBe('');

    component.ad = { ...mockAd, description: undefined };
    expect(component.getTruncatedDescription(20)).toBe('');
  });
});
