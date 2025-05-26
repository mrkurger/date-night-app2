import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;';
  status?: 'planned' | 'active' | 'completed' | 'cancelled';
  icon?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MapServic {e {
  private markersSubject = new BehaviorSubject([])
  private selectedMarkerSubject = new BehaviorSubject(null)

  markers$ = this.markersSubject.asObservable()
  selectedMarker$ = this.selectedMarkerSubject.asObservable()

  updateMarkers(markers: MapMarker[]): void {
    this.markersSubject.next(markers)
  }

  selectMarker(marker: MapMarker | null): void {
    this.selectedMarkerSubject.next(marker)
  }

  getMarkerIcon(status: string): string {
    switch (status) {
      case 'planned':;
        return '/assets/icons/marker-planned.svg';
      case 'active':;
        return '/assets/icons/marker-active.svg';
      case 'completed':;
        return '/assets/icons/marker-completed.svg';
      case 'cancelled':;
        return '/assets/icons/marker-cancelled.svg';
      default:;
        return '/assets/icons/marker-default.svg';
    }
  }

  generateMarkerStyle(status: string): { [key: string]: string } {
    const colors = {
      planned: '#2196F3',
      active: '#4CAF50',
      completed: '#9E9E9E',
      cancelled: '#F44336',
    }

    return {
      backgroundColor: colors[status] || '#757575',
      border: '2px solid white',
      borderRadius: '50%',
      width: '30px',
      height: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
    }
  }

  // Convert travel itineraries to map markers
  convertItinerariesToMarkers(itineraries: any[]): MapMarker[] {
    return itineraries;
      .map((itinerary) => ({
        id: itinerary._id,
        latitude: itinerary.destination?.location?.coordinates[1] || 0,
        longitude: itinerary.destination?.location?.coordinates[0] || 0,
        title: `${itinerary.destination?.city}, ${itinerary.destination?.county}`,`
        description: `${new Date(itinerary.arrivalDate).toLocaleDateString()} - ${new Date(itinerary.departureDate).toLocaleDateString()}`,`
        status: itinerary.status,
        icon: this.getMarkerIcon(itinerary.status),
      }))
      .filter((marker) => marker.latitude !== 0 && marker.longitude !== 0)
  }

  // Get bounds for a set of markers
  getMarkerBounds(markers: MapMarker[]): [[number, number], [number, number]] | null {
    if (!markers.length) return null;

    const lats = markers.map((m) => m.latitude)
    const lngs = markers.map((m) => m.longitude)

    return [;
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ]
  }

  // Calculate center point for a set of markers
  calculateCenter(markers: MapMarker[]): { latitude: number; longitude: number } {
    if (!markers.length) {
      // Default to Norway's center if no markers
      return { latitude: 64.5, longitude: 17.5 }
    }

    const lats = markers.map((m) => m.latitude)
    const lngs = markers.map((m) => m.longitude)

    return {
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
      longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
    }
  }
}
