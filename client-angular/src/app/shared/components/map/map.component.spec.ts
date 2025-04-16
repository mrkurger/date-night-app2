import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MapComponent } from './map.component';
import { Component, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import * as L from 'leaflet';

// Mock Leaflet to avoid DOM manipulation during tests
jest.mock('leaflet', () => {
  const originalModule = jest.requireActual('leaflet');

  // Create mock map instance
  const mockMap = {
    setView: jest.fn().mockReturnThis(),
    remove: jest.fn(),
    on: jest.fn().mockReturnThis(),
    off: jest.fn(),
    invalidateSize: jest.fn(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    getZoom: jest.fn().mockReturnValue(10),
    setZoom: jest.fn(),
    getCenter: jest.fn().mockReturnValue({ lat: 0, lng: 0 }),
    flyTo: jest.fn(),
  };

  // Create mock marker
  const mockMarker = {
    addTo: jest.fn().mockReturnThis(),
    setLatLng: jest.fn().mockReturnThis(),
    bindPopup: jest.fn().mockReturnThis(),
    openPopup: jest.fn(),
    remove: jest.fn(),
    on: jest.fn().mockReturnThis(),
  };

  // Create mock popup
  const mockPopup = {
    setLatLng: jest.fn().mockReturnThis(),
    setContent: jest.fn().mockReturnThis(),
    openOn: jest.fn(),
  };

  // Create mock icon
  const mockIcon = {
    options: {},
  };

  return {
    ...originalModule,
    map: jest.fn().mockReturnValue(mockMap),
    marker: jest.fn().mockReturnValue(mockMarker),
    popup: jest.fn().mockReturnValue(mockPopup),
    icon: jest.fn().mockReturnValue(mockIcon),
    tileLayer: jest.fn().mockReturnValue({
      addTo: jest.fn(),
    }),
    divIcon: jest.fn().mockReturnValue({}),
  };
});

// Test host component to test @Input and @Output
@Component({
  template: `
    <app-map
      #mapComponent
      [height]="height"
      [initialLatitude]="initialLatitude"
      [initialLongitude]="initialLongitude"
      [initialZoom]="initialZoom"
      [selectable]="selectable"
      [markers]="markers"
      [showCurrentLocation]="showCurrentLocation"
      (locationSelected)="onLocationSelected($event)"
      (markerClick)="onMarkerClick($event)"
    ></app-map>
  `,
})
class TestHostComponent {
  @ViewChild('mapComponent') mapComponent!: MapComponent;
  height = '400px';
  initialLatitude = 59.9139;
  initialLongitude = 10.7522;
  initialZoom = 10;
  selectable = true;
  markers = [];
  showCurrentLocation = false;

  selectedLocation: any = null;
  clickedMarker: any = null;

  onLocationSelected(location: any): void {
    this.selectedLocation = location;
  }

  onMarkerClick(marker: any): void {
    this.clickedMarker = marker;
  }
}

describe('MapComponent', () => {
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;
  let component: MapComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestHostComponent],
      imports: [MapComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    component = hostComponent.mapComponent;
    hostFixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct input values', () => {
    expect(component.height).toBe('400px');
    expect(component.initialLatitude).toBe(59.9139);
    expect(component.initialLongitude).toBe(10.7522);
    expect(component.initialZoom).toBe(10);
    expect(component.selectable).toBe(true);
  });

  it('should initialize map on ngAfterViewInit', () => {
    // Call ngAfterViewInit manually
    component.ngAfterViewInit();
    expect(L.map).toHaveBeenCalled();
  });

  it('should clean up map on ngOnDestroy', () => {
    // Initialize map
    component.ngAfterViewInit();

    // Destroy component
    component.ngOnDestroy();

    // Map should be removed
    expect(component.map).toBeNull();
  });

  it('should update markers when markers input changes', () => {
    // Set up test markers
    const testMarkers = [
      { id: '1', latitude: 59.9, longitude: 10.7, title: 'Test 1', description: 'Description 1' },
      { id: '2', latitude: 59.8, longitude: 10.6, title: 'Test 2', description: 'Description 2' },
    ];

    // Update markers
    hostComponent.markers = testMarkers;
    hostFixture.detectChanges();

    // Call updateMarkers manually
    component.updateMarkers(testMarkers);

    // Should create markers
    expect(L.marker).toHaveBeenCalledTimes(2);
  });

  it('should emit location when map is clicked', fakeAsync(() => {
    // Mock map click event
    const mockEvent = { latlng: { lat: 60.0, lng: 11.0 } };

    // Trigger map click handler
    component.onMapClick(mockEvent as any);
    tick();

    // Check if output event was emitted
    expect(hostComponent.selectedLocation).toEqual({
      latitude: 60.0,
      longitude: 11.0,
    });
  }));

  it('should center map to specified coordinates', () => {
    // Call centerMap
    component.centerMap(60.0, 11.0, 12);

    // Map should be centered
    expect(component.map?.flyTo).toHaveBeenCalledWith([60.0, 11.0], 12);
  });

  it('should set selected location', () => {
    // Call setSelectedLocation
    component.setSelectedLocation(60.0, 11.0);

    // Selected location marker should be created
    expect(L.marker).toHaveBeenCalled();
  });

  it('should refresh map', () => {
    // Call refreshMap
    component.refreshMap();

    // Map should be invalidated
    expect(component.map?.invalidateSize).toHaveBeenCalled();
  });

  it('should handle marker click', () => {
    // Set up test marker
    const testMarker = {
      id: '1',
      latitude: 59.9,
      longitude: 10.7,
      title: 'Test',
      description: 'Description',
    };

    // Call onMarkerClick
    component.onMarkerClick(testMarker);

    // Output event should be emitted
    expect(hostComponent.clickedMarker).toEqual(testMarker);
  });

  it('should show current location when enabled', () => {
    // Enable current location
    hostComponent.showCurrentLocation = true;
    hostFixture.detectChanges();

    // Mock geolocation
    const mockGeolocation = {
      getCurrentPosition: jest.fn().mockImplementation(success => {
        success({
          coords: {
            latitude: 60.0,
            longitude: 11.0,
          },
        });
      }),
    };

    // Replace navigator.geolocation
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      configurable: true,
    });

    // Call showCurrentPosition
    component.showCurrentPosition();

    // Current location marker should be created
    expect(L.divIcon).toHaveBeenCalled();
    expect(L.marker).toHaveBeenCalled();
  });
});
