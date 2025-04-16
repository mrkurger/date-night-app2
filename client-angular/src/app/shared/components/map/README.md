# Map Component

A reusable, accessible map component for the Date Night App using Leaflet.

## Features

- Interactive map display with customizable markers
- Location selection functionality
- Current location tracking
- Keyboard navigation for accessibility
- Screen reader support
- Responsive design

## Usage

```html
<app-map
  [height]="'400px'"
  [initialLatitude]="59.9139"
  [initialLongitude]="10.7522"
  [initialZoom]="10"
  [selectable]="true"
  [markers]="mapMarkers"
  [showCurrentLocation]="true"
  (locationSelected)="onLocationSelected($event)"
  (markerClick)="onMarkerClick($event)"
></app-map>
```

## Inputs

| Name                  | Type        | Default | Description                                            |
| --------------------- | ----------- | ------- | ------------------------------------------------------ |
| `height`              | string      | '400px' | Height of the map container                            |
| `initialLatitude`     | number      | 59.9139 | Initial latitude for map center (Oslo, Norway)         |
| `initialLongitude`    | number      | 10.7522 | Initial longitude for map center (Oslo, Norway)        |
| `initialZoom`         | number      | 6       | Initial zoom level                                     |
| `markers`             | MapMarker[] | []      | Array of markers to display on the map                 |
| `selectable`          | boolean     | false   | Whether the map allows location selection via clicking |
| `showCurrentLocation` | boolean     | false   | Whether to show the user's current location on the map |

## Outputs

| Name               | Type                                                                  | Description                                    |
| ------------------ | --------------------------------------------------------------------- | ---------------------------------------------- |
| `markerClick`      | EventEmitter<MapMarker>                                               | Emitted when a marker is clicked               |
| `mapClick`         | EventEmitter<{latitude: number; longitude: number}>                   | Emitted when the map is clicked                |
| `locationSelected` | EventEmitter<{latitude: number; longitude: number; address?: string}> | Emitted when a location is selected on the map |

## MapMarker Interface

```typescript
export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
}
```

## Public Methods

| Method                | Parameters                                         | Return | Description                                          |
| --------------------- | -------------------------------------------------- | ------ | ---------------------------------------------------- |
| `updateMarkers`       | markers: MapMarker[]                               | void   | Update the markers on the map                        |
| `setSelectedLocation` | latitude: number, longitude: number                | void   | Set the selected location on the map                 |
| `centerMap`           | latitude: number, longitude: number, zoom?: number | void   | Center the map on a specific location                |
| `refreshMap`          | none                                               | void   | Refresh the map (useful when container size changes) |

## Accessibility Features

The map component includes several accessibility features:

1. **Keyboard Navigation**

   - Tab to focus on the map
   - Enter to activate keyboard controls
   - Arrow keys to navigate the map
   - Space to select a location (when selectable is true)
   - Plus/minus to zoom in/out

2. **Screen Reader Support**

   - ARIA attributes for map elements
   - Screen reader announcements for important actions
   - Text alternatives for visual elements

3. **Focus Management**

   - Visual focus indicators
   - Logical tab order
   - Focus trapping when needed

4. **Alternative Controls**
   - Button controls for common actions
   - Text alternatives for map interactions

## Examples

### Basic Map Display

```typescript
import { Component } from '@angular/core';
import { MapComponent } from '../../../shared/components/map/map.component';

@Component({
  selector: 'app-location-view',
  template: `
    <app-map
      [height]="'500px'"
      [initialLatitude]="59.9139"
      [initialLongitude]="10.7522"
      [initialZoom]="10"
    ></app-map>
  `,
  standalone: true,
  imports: [MapComponent],
})
export class LocationViewComponent {}
```

### Interactive Map with Markers

```typescript
import { Component, OnInit } from '@angular/core';
import { MapComponent, MapMarker } from '../../../shared/components/map/map.component';

@Component({
  selector: 'app-location-selector',
  template: `
    <app-map
      [height]="'400px'"
      [initialLatitude]="59.9139"
      [initialLongitude]="10.7522"
      [initialZoom]="8"
      [markers]="locations"
      (markerClick)="onMarkerClick($event)"
    ></app-map>
  `,
  standalone: true,
  imports: [MapComponent],
})
export class LocationSelectorComponent implements OnInit {
  locations: MapMarker[] = [];

  ngOnInit(): void {
    this.locations = [
      {
        id: '1',
        latitude: 59.9139,
        longitude: 10.7522,
        title: 'Oslo',
        description: 'Capital of Norway',
        color: 'blue',
      },
      {
        id: '2',
        latitude: 60.3913,
        longitude: 5.3221,
        title: 'Bergen',
        description: 'City on the west coast',
        color: 'green',
      },
    ];
  }

  onMarkerClick(marker: MapMarker): void {
    console.log('Marker clicked:', marker);
  }
}
```

### Location Selection

```typescript
import { Component } from '@angular/core';
import { MapComponent } from '../../../shared/components/map/map.component';

@Component({
  selector: 'app-location-picker',
  template: `
    <app-map
      [height]="'400px'"
      [initialLatitude]="59.9139"
      [initialLongitude]="10.7522"
      [initialZoom]="10"
      [selectable]="true"
      (locationSelected)="onLocationSelected($event)"
    ></app-map>

    <div *ngIf="selectedLocation">
      <p>Selected Location:</p>
      <p>Latitude: {{ selectedLocation.latitude | number: '1.6-6' }}</p>
      <p>Longitude: {{ selectedLocation.longitude | number: '1.6-6' }}</p>
      <p *ngIf="selectedLocation.address">Address: {{ selectedLocation.address }}</p>
    </div>
  `,
  standalone: true,
  imports: [MapComponent, CommonModule],
})
export class LocationPickerComponent {
  selectedLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  } | null = null;

  onLocationSelected(location: { latitude: number; longitude: number; address?: string }): void {
    this.selectedLocation = location;
  }
}
```

## Dependencies

- Leaflet (v1.9.4 or later)
- Angular (v16 or later)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## Accessibility Compliance

This component aims to meet WCAG 2.1 AA standards, including:

- 1.3.1: Info and Relationships
- 1.4.3: Contrast (Minimum)
- 2.1.1: Keyboard
- 2.4.3: Focus Order
- 2.4.7: Focus Visible
- 4.1.2: Name, Role, Value
