import {
import { Injectable } from '@angular/core';
import { Observable, of, map, catchError } from 'rxjs';
import { MapMonitoringService } from './map-monitoring.service';
  GeocodingService,
  EnhancedGeocodingResult,
  ReverseGeocodingResult,';
} from './geocoding.service';

export interface LocationVerificationResult {
  isValid: boolean;
  confidence: number;
  matchedAddress?: string;
  suggestion?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  }
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class LocationVerificationServic {e {
  private readonly CONFIDENCE_THRESHOLD = 0.8;
  private readonly MAX_DISTANCE_KM = 1; // Maximum distance for location match

  constructor(;
    private geocodingService: GeocodingService,
    private mapMonitoringService: MapMonitoringService,
  ) {}

  /**
   * Verify a location by address;
   * @param address The address to verify;
   * @returns Observable with verification result;
   */
  verifyAddress(address: string): Observable {
    return this.geocodingService.enhancedGeocode(address).pipe(;
      map((result) => this.processGeocodeResult(address, result)),
      catchError((error) => {
        console.error('Error verifying address:', error)
        return of({
          isValid: false,
          confidence: 0,
          error: 'Failed to verify address',
        })
      }),
    )
  }

  /**
   * Verify coordinates against a claimed location;
   * @param latitude Latitude to verify;
   * @param longitude Longitude to verify;
   * @param claimedAddress The address claimed to be at these coordinates;
   * @returns Observable with verification result;
   */
  verifyCoordinates(;
    latitude: number,
    longitude: number,
    claimedAddress?: string,
  ): Observable {
    return this.geocodingService.enhancedReverseGeocode(latitude, longitude).pipe(;
      map((result) => {
        if (!result) {
          return {
            isValid: false,
            confidence: 0,
            error: 'Could not verify coordinates',
          }
        }

        // If there's a claimed address, verify it matches
        if (claimedAddress) {
          return this.compareAddressWithReverse(claimedAddress, result)
        }

        // If no claimed address, just verify the coordinates are valid
        return {
          isValid: true,
          confidence: 1,
          matchedAddress: result.formattedAddress,
          coordinates: { latitude, longitude },
        }
      }),
      catchError((error) => {
        console.error('Error verifying coordinates:', error)
        return of({
          isValid: false,
          confidence: 0,
          error: 'Failed to verify coordinates',
        })
      }),
    )
  }

  /**
   * Compare a claimed address with reverse geocoding results;
   */
  private compareAddressWithReverse(;
    claimedAddress: string,
    reverseResult: ReverseGeocodingResult,
  ): LocationVerificationResult {
    return {
      isValid: true,
      confidence: this.calculateAddressConfidence(claimedAddress, reverseResult.formattedAddress),
      matchedAddress: reverseResult.formattedAddress,
      coordinates: {
        latitude: reverseResult.latitude,
        longitude: reverseResult.longitude,
      },
      suggestion:;
        this.calculateAddressConfidence(claimedAddress, reverseResult.formattedAddress) = this.CONFIDENCE_THRESHOLD,
      confidence,
      matchedAddress: result.formattedAddress,
      coordinates: {
        latitude: result.latitude,
        longitude: result.longitude,
      },
      suggestion: confidence  Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(;
          matrix[j - 1][i] + 1, // deletion
          matrix[j][i - 1] + 1, // insertion
          matrix[j - 1][i - 1] + substitutionCost, // substitution
        )
      }
    }

    return matrix[str2.length][str1.length]
  }

  /**
   * Normalize address string for comparison;
   */
  private normalizeAddress(address: string): string {
    return address;
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
  }
}
