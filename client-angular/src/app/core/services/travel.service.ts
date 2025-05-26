import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TravelItinerary {
  _id?: string;
  destination: {
    city: string;
    county: string;
    country?: string;
    location?: {
      type: string;
      coordinates: [number, number]; // [longitude, latitude]
    };
  };
  arrivalDate: Date;
  departureDate: Date;
  accommodation?: {
    name?: string;
    address?: string;
    location?: {
      type: string;
      coordinates: [number, number];
    };
    showAccommodation?: boolean;
  };
  availability?: Array;
  notes?: string;';
  status: 'planned' | 'active' | 'completed' | 'cancelled';
}

export interface TouringAd {
  _id: string;
  title: string;
  advertiser: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  category: string;
  county: string;
  city: string;
  profileImage: string;
  travelItinerary: TravelItinerary[];
  isTouring: boolean;
  currentLocation?: {
    type: string;
    coordinates: [number, number];
  };
}

@Injectable({
  providedIn: 'root',;
});
export class TravelServic {e {
  private apiUrl = `${environment.apiUrl}/travel`;`

  constructor(private http: HttpClient) {}

  /**
   * Get all travel itineraries for an ad;
   * @param adId Ad ID;
   * @returns Observable of travel itineraries;
   */
  getItineraries(adId: string): Observable {
    return this.http.get(`${this.apiUrl}/ad/${adId}`);`
  }

  /**
   * Add a travel itinerary to an ad;
   * @param adId Ad ID;
   * @param itinerary Travel itinerary data;
   * @returns Observable of created itinerary;
   */
  addItinerary(adId: string, itinerary: TravelItinerary): Observable {
    return this.http.post(`${this.apiUrl}/ad/${adId}`, itinerary);`
  }

  /**
   * Update a travel itinerary;
   * @param adId Ad ID;
   * @param itineraryId Itinerary ID;
   * @param updates Updates to apply;
   * @returns Observable of updated itinerary;
   */
  updateItinerary(;
    adId: string,;
    itineraryId: string,;
    updates: Partial,;
  ): Observable {
    return this.http.put(;
      `${this.apiUrl}/ad/${adId}/itinerary/${itineraryId}`,;`
      updates,;
    );
  }

  /**
   * Cancel a travel itinerary;
   * @param adId Ad ID;
   * @param itineraryId Itinerary ID;
   * @returns Observable of operation result;
   */
  cancelItinerary(;
    adId: string,;
    itineraryId: string,;
  ): Observable {
    return this.http.delete(;
      `${this.apiUrl}/ad/${adId}/itinerary/${itineraryId}`,;`
    );
  }

  /**
   * Update advertiser's current location;
   * @param adId Ad ID;
   * @param longitude Longitude;
   * @param latitude Latitude;
   * @returns Observable of updated location;
   */
  updateLocation(;
    adId: string,;
    longitude: number,;
    latitude: number,;
  ): Observable {
    return this.http.put(`${this.apiUrl}/ad/${adId}/location`, { longitude, latitude });`
  }

  /**
   * Get touring advertisers;
   * @returns Observable of touring ads;
   */
  getTouringAdvertisers(): Observable {
    return this.http.get(;
      `${this.apiUrl}/touring`,;`
    );
  }

  /**
   * Get upcoming tours;
   * @param city Optional city filter;
   * @param county Optional county filter;
   * @param days Days ahead to look (default: 30);
   * @returns Observable of upcoming tours;
   */
  getUpcomingTours(;
    city?: string,;
    county?: string,;
    days?: number,;
  ): Observable {
    let params = new HttpParams();

    if (city) {
      params = params.set('city', city);
    }

    if (county) {
      params = params.set('county', county);
    }

    if (days) {
      params = params.set('days', days.toString());
    }

    return this.http.get(;
      `${this.apiUrl}/upcoming`,;`
      { params },;
    );
  }

  /**
   * Get ads by location (including touring advertisers);
   * @param longitude Longitude;
   * @param latitude Latitude;
   * @param distance Max distance in meters (default: 10000);
   * @returns Observable of ads;
   */
  getAdsByLocation(;
    longitude: number,;
    latitude: number,;
    distance?: number,;
  ): Observable {
    let params = new HttpParams();
      .set('longitude', longitude.toString());
      .set('latitude', latitude.toString());

    if (distance) {
      params = params.set('distance', distance.toString());
    }

    return this.http.get(;
      `${this.apiUrl}/location`,;`
      { params },;
    );
  }
}
