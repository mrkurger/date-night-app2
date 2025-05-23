/**
 * Norwegian counties and locations
 * Used for location-based services and validation
 */

// Norwegian counties
export const norwegianCounties = [
  'Oslo',
  'Viken',
  'Innlandet',
  'Vestfold og Telemark',
  'Agder',
  'Rogaland',
  'Vestland',
  'Møre og Romsdal',
  'Trøndelag',
  'Nordland',
  'Troms og Finnmark'
];

// Major Norwegian cities with coordinates
export const majorCities = [
  {
    name: 'Oslo',
    county: 'Oslo',
    coordinates: [10.7522, 59.9139],
    postalCodes: ['0001', '0010', '0015', '0025', '0050', '0101', '0102', '0103', '0104', '0105']
  },
  {
    name: 'Bergen',
    county: 'Vestland',
    coordinates: [5.3221, 60.3913],
    postalCodes: ['5003', '5004', '5005', '5006', '5007', '5008', '5009', '5010']
  },
  {
    name: 'Trondheim',
    county: 'Trøndelag',
    coordinates: [10.3951, 63.4305],
    postalCodes: ['7010', '7011', '7012', '7013', '7014', '7015', '7016', '7017']
  },
  {
    name: 'Stavanger',
    county: 'Rogaland',
    coordinates: [5.7331, 58.9701],
    postalCodes: ['4001', '4002', '4003', '4004', '4005', '4006', '4007', '4008']
  },
  {
    name: 'Tromsø',
    county: 'Troms og Finnmark',
    coordinates: [18.9553, 69.6489],
    postalCodes: ['9008', '9009', '9010', '9011', '9012', '9013', '9014', '9015']
  }
];

// Map of postal codes to cities and counties
export const postalCodeMap = majorCities.reduce((map, city) => {
  city.postalCodes.forEach(postalCode => {
    map[postalCode] = {
      city: city.name,
      county: city.county
    };
  });
  return map;
}, {});

// Function to validate if a postal code exists in Norway
export const isValidNorwegianPostalCode = (postalCode) => {
  return /^\d{4}$/.test(postalCode);
};

// Function to get location data for a valid postal code
export const getLocationByPostalCode = (postalCode) => {
  return postalCodeMap[postalCode] || null;
};

// Default export for all location data
export default {
  norwegianCounties,
  majorCities,
  postalCodeMap,
  isValidNorwegianPostalCode,
  getLocationByPostalCode
};