# Location Data in DateNight.io

## Overview

DateNight.io uses a comprehensive database of Norwegian counties and cities to support location-based features, particularly for the travel itinerary system. This document explains how location data is structured and used throughout the application.

## Data Structure

The location data is organized hierarchically:

- **Counties**: Norway is divided into 11 counties (fylker)
- **Cities**: Each county contains multiple cities and towns
- **Coordinates**: Each city has geographic coordinates (longitude, latitude)

## Implementation

### Frontend

Location data is available through the `LocationService` which provides methods for:

- Getting all counties
- Getting cities for a specific county
- Getting coordinates for a specific city
- Finding the nearest city to a set of coordinates
- Getting the user's current location

The service first attempts to fetch data from the backend API, and falls back to local constants if the API is unavailable.

### Backend

The backend provides a set of RESTful endpoints for accessing location data:

- `GET /api/v1/locations/counties` - Get all Norwegian counties
- `GET /api/v1/locations/counties/:countyName/cities` - Get all cities for a specific county
- `GET /api/v1/locations/cities` - Get all Norwegian cities
- `GET /api/v1/locations/cities/:cityName/coordinates` - Get coordinates for a specific city
- `GET /api/v1/locations/nearest-city` - Find the nearest city to given coordinates

## Norwegian Counties and Major Cities

Here's a list of all Norwegian counties and some of their major cities:

1. **Oslo**
   - Oslo

2. **Viken**
   - Drammen
   - Fredrikstad
   - Sarpsborg
   - Moss
   - Lillestrøm
   - Asker
   - Bærum

3. **Innlandet**
   - Hamar
   - Lillehammer
   - Gjøvik
   - Elverum
   - Kongsvinger

4. **Vestfold og Telemark**
   - Tønsberg
   - Sandefjord
   - Larvik
   - Skien
   - Porsgrunn

5. **Agder**
   - Kristiansand
   - Arendal
   - Grimstad
   - Mandal
   - Flekkefjord

6. **Rogaland**
   - Stavanger
   - Sandnes
   - Haugesund
   - Egersund
   - Bryne

7. **Vestland**
   - Bergen
   - Førde
   - Florø
   - Sogndal
   - Voss

8. **Møre og Romsdal**
   - Ålesund
   - Molde
   - Kristiansund
   - Ulsteinvik
   - Volda

9. **Trøndelag**
   - Trondheim
   - Steinkjer
   - Stjørdalshalsen
   - Levanger
   - Namsos

10. **Nordland**
    - Bodø
    - Narvik
    - Mo i Rana
    - Mosjøen
    - Fauske

11. **Troms og Finnmark**
    - Tromsø
    - Alta
    - Harstad
    - Hammerfest
    - Kirkenes

## Usage in the Application

### Ad Creation

When creating or editing an advertisement, users select:
1. The county from a dropdown list
2. The city from a dropdown list (filtered based on the selected county)

The system automatically associates geographic coordinates with the selected city.

### Travel Itinerary

The travel itinerary feature uses location data to:
1. Allow advertisers to select destinations by county and city
2. Display travel plans on a map using the coordinates
3. Enable location-based searching for users
4. Implement proximity alerts when advertisers are near users

### Location-Based Matching

The application uses location data to:
1. Find ads near the user's current location
2. Filter ads by county or city
3. Show distance information between users and advertisers
4. Sort results by proximity

## Extending the Location Data

To add more cities or update coordinates:

1. Edit the `norway-locations.ts` file in the frontend
2. Edit the `norway-locations.js` file in the backend
3. Ensure both files remain synchronized

## Future Enhancements

Planned improvements to the location system include:

1. Integration with external mapping APIs for more accurate geocoding
2. Support for more detailed location information (neighborhoods, postal codes)
3. Expansion to other Scandinavian countries
4. Heat maps showing concentration of advertisers by region