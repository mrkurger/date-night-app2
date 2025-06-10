// This file defines common types for the travel feature
// to avoid import conflicts

export interface TravelItinerary {
  id: string;
  destination: {
    city: string;
    county: string;
    location: {
      coordinates: [number, number]; // Typed as tuple
    };
  };
  arrivalDate: string;
  departureDate: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  notes?: string;
  accommodation?: {
    name: string;
    address: string;
  };
}
