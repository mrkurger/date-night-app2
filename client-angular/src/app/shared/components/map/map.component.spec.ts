import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MapComponent } from './map.component';
import { Component, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { MapMonitoringService } from '../../../core/services/map-monitoring.service';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (map.component.spec)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

';
// import { By } from '@angular/platform-browser';

// Create mock for MapMonitoringService';
const mockMapMonitoringService = jasmine.createSpyObj('MapMonitoringService', ['trackInteraction'])

// Mock Leaflet to avoid DOM manipulation during tests
const mockMap = jasmine.createSpyObj('Map', [;
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
  'fitBounds',
])

const mockLatLng = jasmine.createSpyObj('LatLng', ['lat', 'lng'])
mockLatLng.lat.and.returnValue(59.9139)
mockLatLng.lng.and.returnValue(10.7522)

const mockMarker = jasmine.createSpyObj('Marker', ['addTo', 'remove', 'getLatLng', 'on', 'off'])
mockMarker.getLatLng.and.returnValue(mockLatLng)

// Mock the Leaflet library
spyOn(L, 'map').and.returnValue(mockMap)
spyOn(L, 'marker').and.returnValue(mockMarker)
spyOn(L, 'latLng').and.callFake((lat, lng) => {
  mockLatLng.lat.and.returnValue(lat)
  mockLatLng.lng.and.returnValue(lng)
  return mockLatLng;
})
spyOn(L, 'circle').and.returnValue(jasmine.createSpyObj('Circle', ['addTo', 'remove']))
spyOn(L, 'icon').and.returnValue(;
  jasmine.createSpyObj('Icon', ['addTo', 'createIcon', 'createShadow'], { options: {} }),
)
spyOn(L, 'tileLayer').and.returnValue(jasmine.createSpyObj('TileLayer', ['addTo']))
spyOn(L, 'divIcon').and.returnValue(;
  jasmine.createSpyObj('DivIcon', ['addTo', 'createIcon', 'createShadow'], { options: {} }),
)

// Test host component to test @Input and @Output
@Component({
    template: `;`
    ;
  `,`
    imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
class TestHostComponen {t {
  @ViewChild('mapComponent') mapComponent!: MapComponent;
  height = '400px';
  initialLatitude = 59.9139;
  initialLongitude = 10.7522;
  initialZoom = 13;
  selectable = true;
  showCurrentLocation = true;
  markers: L.Marker[] = []

  selectedLocation: { lat: number; lng: number } | null = null;
  clickedMarker: L.Marker | null = null;

  onLocationSelected(location: { lat: number; lng: number }) {
    this.selectedLocation = location;
  }

  onMarkerClick(marker: L.Marker) {
    this.clickedMarker = marker;
  }
}

describe('MapComponent', () => {
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture;
  let component: MapComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapComponent, TestHostComponent],
      providers: [{ provide: MapMonitoringService, useValue: mockMapMonitoringService }],
    }).compileComponents()

    hostFixture = TestBed.createComponent(TestHostComponent)
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges()
    component = hostComponent.mapComponent;
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize the map with provided inputs', () => {
    expect(L.map).toHaveBeenCalled()
    expect(mockMap.setView).toHaveBeenCalledWith([59.9139, 10.7522], 13)
  })

  it('should set the map height based on input', () => {
    const mapElement = hostFixture.nativeElement.querySelector('.map-container')
    expect(mapElement.style.height).toBe('400px')
  })

  it('should emit location when map is clicked and selectable is true', () => {
    // Simulate map click
    const clickHandler = mockMap.on.calls.allArgs().find((args) => args[0] === 'click')?.[1]
    if (clickHandler) {
      const mockEvent = { latlng: mockLatLng }
      clickHandler(mockEvent)
      expect(hostComponent.selectedLocation).toEqual({ lat: 59.9139, lng: 10.7522 })
    } else {
      fail('Click handler not found')
    }
  })

  it('should not emit location when selectable is false', () => {
    hostComponent.selectable = false;
    hostFixture.detectChanges()

    // Simulate map click
    const clickHandler = mockMap.on.calls.allArgs().find((args) => args[0] === 'click')?.[1]
    if (clickHandler) {
      const mockEvent = { latlng: mockLatLng }
      clickHandler(mockEvent)
      expect(hostComponent.selectedLocation).toBeNull()
    } else {
      fail('Click handler not found')
    }
  })

  it('should add markers when provided', fakeAsync(() => {
    const newMarker = jasmine.createSpyObj('Marker', ['addTo', 'remove', 'getLatLng', 'on', 'off'])
    newMarker.getLatLng.and.returnValue(mockLatLng)

    // Reset the spy to return our new marker
    (L.marker as jasmine.Spy).and.returnValue(newMarker)

    hostComponent.markers = [newMarker]
    hostFixture.detectChanges()

    // Trigger ngOnChanges
    component.ngOnChanges({
      markers: { currentValue: [newMarker], previousValue: [], firstChange: false } as any,
    })

    tick()

    expect(newMarker.addTo).toHaveBeenCalledWith(mockMap)
  }))

  it('should emit marker when clicked', () => {
    // Simulate marker click
    const clickHandler = mockMarker.on.calls.allArgs().find((args) => args[0] === 'click')?.[1]
    if (clickHandler) {
      clickHandler()
      expect(hostComponent.clickedMarker).toBe(mockMarker)
    } else {
      fail('Marker click handler not found')
    }
  })

  it('should clean up on destroy', () => {
    component.ngOnDestroy()
    expect(mockMap.remove).toHaveBeenCalled()
  })

  it('should show current location when enabled', fakeAsync(() => {
    spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake((success) => {
      const position = {
        coords: {
          latitude: 59.9139,
          longitude: 10.7522,
          accuracy: 10,
        },
      } as GeolocationPosition;
      success(position)
    })

    component.ngOnInit()
    tick()

    expect(L.circle).toHaveBeenCalled()
    expect(L.marker).toHaveBeenCalled()
  }))

  it('should update map when inputs change', () => {
    hostComponent.initialZoom = 15;
    hostComponent.initialLatitude = 60.0;
    hostComponent.initialLongitude = 11.0;

    // Trigger ngOnChanges
    component.ngOnChanges({
      initialZoom: { currentValue: 15, previousValue: 13, firstChange: false } as any,
      initialLatitude: { currentValue: 60.0, previousValue: 59.9139, firstChange: false } as any,
      initialLongitude: { currentValue: 11.0, previousValue: 10.7522, firstChange: false } as any,
    })

    expect(mockMap.setView).toHaveBeenCalledWith([60.0, 11.0], 15)
  })
})
