// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (map.component.spec)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MapComponent } from './map.component';
import { Component, ViewChild , OnDestroy} from '@angular/core';
// import { By } from '@angular/platform-browser';
import * as L from 'leaflet';
import { MapMonitoringService } from '../../../core/services/map-monitoring.service';

// Create mock for MapMonitoringService
const mockMapMonitoringService = jasmine.createSpyObj('MapMonitoringService', ['trackInteraction']);

// Mock Leaflet to avoid DOM manipulation during tests
const mockMap = jasmine.createSpyObj('Map', [
  'setView',
  'remove',
  'on',
  'off',
  'invalidateSize',
  'addLayer',
  'removeLayer',
  'getZoom',
  'setZoom',
  'getCenter',
  'flyTo',
]);
mockMap.setView.and.returnValue(mockMap);
mockMap.on.and.returnValue(mockMap);
mockMap.getZoom.and.returnValue(10);
mockMap.getCenter.and.returnValue({ lat: 0, lng: 0 });

const mockMarker = jasmine.createSpyObj('Marker', [
  'addTo',
  'setLatLng',
  'bindPopup',
  'openPopup',
  'remove',
  'on',
]);
mockMarker.addTo.and.returnValue(mockMarker);
mockMarker.setLatLng.and.returnValue(mockMarker);
mockMarker.bindPopup.and.returnValue(mockMarker);
mockMarker.on.and.returnValue(mockMarker);

const mockPopup = jasmine.createSpyObj('Popup', ['setLatLng', 'setContent', 'openOn']);
mockPopup.setLatLng.and.returnValue(mockPopup);
mockPopup.setContent.and.returnValue(mockPopup);

// Create spies for Leaflet functions
spyOn(L, 'map').and.returnValue(mockMap);
spyOn(L, 'marker').and.returnValue(mockMarker);
spyOn(L, 'popup').and.returnValue(mockPopup);
spyOn(L, 'icon').and.returnValue(
  jasmine.createSpyObj('Icon', ['addTo', 'createIcon', 'createShadow'], { options: {} }),
);
spyOn(L, 'tileLayer').and.returnValue(jasmine.createSpyObj('TileLayer', ['addTo']));
spyOn(L, 'divIcon').and.returnValue(
  jasmine.createSpyObj('DivIcon', ['addTo', 'createIcon', 'createShadow'], { options: {} }),
);

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
  `,,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
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
      providers: [{ provide: MapMonitoringService, useValue: mockMapMonitoringService }],
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

    // Map's remove method should have been called
    expect(mockMap.remove).toHaveBeenCalled();
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
    // Spy on the output event
    spyOn(component.mapClick, 'emit');

    // Initialize map
    component.ngAfterViewInit();

    // Simulate map click by calling the callback directly
    // First, find the 'on' call for the click event
    const clickHandler = mockMap.on.calls.all().find((call) => call.args[0] === 'click')?.args[1];
    expect(clickHandler).toBeDefined();

    // Call the click handler with a mock event
    if (clickHandler) {
      clickHandler({ latlng: { lat: 60.0, lng: 11.0 } });
      tick();

      // Check if mapClick was emitted
      expect(component.mapClick.emit).toHaveBeenCalled();
    }
  }));

  it('should center map to specified coordinates', () => {
    // Call centerMap
    component.centerMap(60.0, 11.0, 12);

    // Map should be centered
    expect(mockMap.flyTo).toHaveBeenCalledWith([60.0, 11.0], 12);
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
    expect(mockMap.invalidateSize).toHaveBeenCalled();
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

    // Spy on the output event
    spyOn(component.markerClick, 'emit');

    // Initialize map and add markers
    component.ngAfterViewInit();
    component.updateMarkers([testMarker]);

    // Simulate marker click by finding the marker click handler
    const markerClickHandler = mockMarker.on.calls.all().find((call) => call.args[0] === 'click')
      ?.args[1];
    expect(markerClickHandler).toBeDefined();

    if (markerClickHandler) {
      markerClickHandler();

      // Check if markerClick was emitted
      expect(component.markerClick.emit).toHaveBeenCalled();
    }
  });

  it('should show current location when enabled', () => {
    // Mock geolocation API
    const mockGeolocation = {
      getCurrentPosition: jasmine.createSpy('getCurrentPosition').and.callFake((success) => {
        success({
          coords: {
            latitude: 60.0,
            longitude: 11.0,
          },
        });
      }),
    };

    // Replace navigator.geolocation with our mock
    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      configurable: true,
      writable: true,
    });

    // Enable current location
    component.showCurrentLocation = true;
    component.ngOnChanges({
      showCurrentLocation: {
        currentValue: true,
        previousValue: false,
        firstChange: false,
        isFirstChange: () => false,
      },
    } as any);

    // Verify geolocation was used
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
  });
});
