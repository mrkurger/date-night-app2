/**
 * Norwegian counties and cities
 *
 * This file contains a comprehensive list of Norwegian counties and their cities.
 * Used for location selection in the application, particularly for the travel itinerary feature.
 */

export interface NorwayCity {
  name: string;
  postalCodes?: string[]; // Optional postal codes for the city
  coordinates?: [number, number]; // [longitude, latitude]
}

export interface NorwayCounty {
  name: string;
  cities: NorwayCity[];
}

/**
 * List of Norwegian counties with their major cities
 */
export const NORWAY_COUNTIES: NorwayCounty[] = [
  {
    name: 'Oslo',
    cities: [
      { name: 'Oslo', coordinates: [10.7522, 59.9139] },
      { name: 'Nordstrand', coordinates: [10.8007, 59.8651] },
      { name: 'Frogner', coordinates: [10.7113, 59.9208] },
      { name: 'Grünerløkka', coordinates: [10.7584, 59.9236] },
      { name: 'Sagene', coordinates: [10.7507, 59.9372] },
    ],
  },
  {
    name: 'Viken',
    cities: [
      { name: 'Drammen', coordinates: [10.2052, 59.744] },
      { name: 'Fredrikstad', coordinates: [10.9298, 59.2181] },
      { name: 'Sarpsborg', coordinates: [11.1094, 59.2837] },
      { name: 'Moss', coordinates: [10.66, 59.435] },
      { name: 'Lillestrøm', coordinates: [11.0518, 59.9558] },
      { name: 'Asker', coordinates: [10.4387, 59.8342] },
      { name: 'Bærum', coordinates: [10.5226, 59.8941] },
      { name: 'Ski', coordinates: [10.8364, 59.7194] },
      { name: 'Jessheim', coordinates: [11.1704, 60.141] },
      { name: 'Sandvika', coordinates: [10.5262, 59.8909] },
    ],
  },
  {
    name: 'Innlandet',
    cities: [
      { name: 'Hamar', coordinates: [11.0628, 60.7945] },
      { name: 'Lillehammer', coordinates: [10.4662, 61.1152] },
      { name: 'Gjøvik', coordinates: [10.6918, 60.7945] },
      { name: 'Elverum', coordinates: [11.5621, 60.8827] },
      { name: 'Kongsvinger', coordinates: [12.005, 60.1918] },
      { name: 'Brumunddal', coordinates: [10.9334, 60.8793] },
      { name: 'Moelv', coordinates: [10.7, 60.9333] },
      { name: 'Raufoss', coordinates: [10.6167, 60.7333] },
      { name: 'Otta', coordinates: [9.5333, 61.7667] },
      { name: 'Vinstra', coordinates: [9.75, 61.5833] },
    ],
  },
  {
    name: 'Vestfold og Telemark',
    cities: [
      { name: 'Tønsberg', coordinates: [10.4078, 59.2674] },
      { name: 'Sandefjord', coordinates: [10.2167, 59.1333] },
      { name: 'Larvik', coordinates: [10.0333, 59.05] },
      { name: 'Skien', coordinates: [9.61, 59.21] },
      { name: 'Porsgrunn', coordinates: [9.6561, 59.1408] },
      { name: 'Horten', coordinates: [10.4833, 59.4167] },
      { name: 'Notodden', coordinates: [9.25, 59.5667] },
      { name: 'Kragerø', coordinates: [9.4167, 58.8667] },
      { name: 'Stokke', coordinates: [10.3, 59.2333] },
      { name: 'Holmestrand', coordinates: [10.3167, 59.4833] },
    ],
  },
  {
    name: 'Agder',
    cities: [
      { name: 'Kristiansand', coordinates: [7.9956, 58.1599] },
      { name: 'Arendal', coordinates: [8.7667, 58.4667] },
      { name: 'Grimstad', coordinates: [8.5994, 58.3404] },
      { name: 'Mandal', coordinates: [7.45, 58.0333] },
      { name: 'Flekkefjord', coordinates: [6.6667, 58.3] },
      { name: 'Lillesand', coordinates: [8.3833, 58.25] },
      { name: 'Risør', coordinates: [9.2333, 58.7167] },
      { name: 'Tvedestrand', coordinates: [8.9333, 58.6167] },
      { name: 'Farsund', coordinates: [6.8, 58.0833] },
      { name: 'Vennesla', coordinates: [7.9667, 58.2667] },
    ],
  },
  {
    name: 'Rogaland',
    cities: [
      { name: 'Stavanger', coordinates: [5.7331, 58.97] },
      { name: 'Sandnes', coordinates: [5.7333, 58.85] },
      { name: 'Haugesund', coordinates: [5.2667, 59.4167] },
      { name: 'Egersund', coordinates: [5.99, 58.45] },
      { name: 'Bryne', coordinates: [5.65, 58.7333] },
      { name: 'Kopervik', coordinates: [5.3, 59.2833] },
      { name: 'Åkrehamn', coordinates: [5.1833, 59.25] },
      { name: 'Sauda', coordinates: [6.35, 59.65] },
      { name: 'Jørpeland', coordinates: [6.0333, 59.0167] },
      { name: 'Sola', coordinates: [5.6333, 58.8833] },
    ],
  },
  {
    name: 'Vestland',
    cities: [
      { name: 'Bergen', coordinates: [5.322, 60.3913] },
      { name: 'Førde', coordinates: [5.85, 61.45] },
      { name: 'Florø', coordinates: [5.0333, 61.6] },
      { name: 'Sogndal', coordinates: [7.1, 61.2333] },
      { name: 'Voss', coordinates: [6.4167, 60.6333] },
      { name: 'Odda', coordinates: [6.55, 60.0667] },
      { name: 'Leirvik', coordinates: [5.5, 59.7833] },
      { name: 'Askøy', coordinates: [5.2, 60.4667] },
      { name: 'Knarvik', coordinates: [5.2833, 60.55] },
      { name: 'Straume', coordinates: [5.1167, 60.3667] },
    ],
  },
  {
    name: 'Møre og Romsdal',
    cities: [
      { name: 'Ålesund', coordinates: [6.15, 62.4667] },
      { name: 'Molde', coordinates: [7.16, 62.7375] },
      { name: 'Kristiansund', coordinates: [7.7333, 63.1167] },
      { name: 'Ulsteinvik', coordinates: [5.8833, 62.3333] },
      { name: 'Volda', coordinates: [6.0667, 62.15] },
      { name: 'Ørsta', coordinates: [6.1333, 62.2] },
      { name: 'Sunndalsøra', coordinates: [8.55, 62.6667] },
      { name: 'Spjelkavik', coordinates: [6.3333, 62.45] },
      { name: 'Åndalsnes', coordinates: [7.6833, 62.5667] },
      { name: 'Stranda', coordinates: [6.95, 62.3] },
    ],
  },
  {
    name: 'Trøndelag',
    cities: [
      { name: 'Trondheim', coordinates: [10.3951, 63.4305] },
      { name: 'Steinkjer', coordinates: [11.5, 64.0167] },
      { name: 'Stjørdalshalsen', coordinates: [11.1667, 63.4667] },
      { name: 'Levanger', coordinates: [11.3, 63.75] },
      { name: 'Namsos', coordinates: [11.5, 64.4667] },
      { name: 'Verdalsøra', coordinates: [11.5, 63.8] },
      { name: 'Orkanger', coordinates: [9.85, 63.3] },
      { name: 'Røros', coordinates: [11.3833, 62.5833] },
      { name: 'Brekstad', coordinates: [10.0, 63.6833] },
      { name: 'Oppdal', coordinates: [9.6833, 62.6] },
    ],
  },
  {
    name: 'Nordland',
    cities: [
      { name: 'Bodø', coordinates: [14.4042, 67.2804] },
      { name: 'Narvik', coordinates: [17.4272, 68.4384] },
      { name: 'Mo i Rana', coordinates: [14.1333, 66.3167] },
      { name: 'Mosjøen', coordinates: [13.1833, 65.8333] },
      { name: 'Fauske', coordinates: [15.3833, 67.2667] },
      { name: 'Brønnøysund', coordinates: [12.2167, 65.4667] },
      { name: 'Sandnessjøen', coordinates: [12.6333, 66.0167] },
      { name: 'Leknes', coordinates: [13.6167, 68.15] },
      { name: 'Svolvær', coordinates: [14.5667, 68.2333] },
      { name: 'Sortland', coordinates: [15.4167, 68.7] },
    ],
  },
  {
    name: 'Troms og Finnmark',
    cities: [
      { name: 'Tromsø', coordinates: [18.9553, 69.6489] },
      { name: 'Alta', coordinates: [23.2712, 69.9689] },
      { name: 'Harstad', coordinates: [16.5333, 68.8] },
      { name: 'Hammerfest', coordinates: [23.6833, 70.6633] },
      { name: 'Kirkenes', coordinates: [30.0458, 69.7267] },
      { name: 'Finnsnes', coordinates: [17.9833, 69.2333] },
      { name: 'Vadsø', coordinates: [29.75, 70.0833] },
      { name: 'Honningsvåg', coordinates: [25.9667, 70.9833] },
      { name: 'Bardufoss', coordinates: [18.5333, 69.0667] },
      { name: 'Lakselv', coordinates: [24.95, 70.05] },
    ],
  },
];

/**
 * Get a flat list of all Norwegian counties
 */
export const getAllCounties = (): string[] => NORWAY_COUNTIES.map((county) => county.name);

/**
 * Get a flat list of all Norwegian cities
 */
export const getAllCities = (): string[] =>
  NORWAY_COUNTIES.flatMap((county) => county.cities.map((city) => city.name));

/**
 * Get all cities for a specific county
 * @param countyName The name of the county
 */
export const getCitiesByCounty = (countyName: string): NorwayCity[] => {
  const county = NORWAY_COUNTIES.find((c) => c.name === countyName);
  return county ? county.cities : [];
};

/**
 * Get the county for a specific city
 * @param cityName The name of the city
 */
export const getCountyByCity = (cityName: string): string | null => {
  const county = NORWAY_COUNTIES.find((c) => c.cities.some((city) => city.name === cityName));
  return county ? county.name : null;
};

/**
 * Get coordinates for a specific city
 * @param cityName The name of the city
 */
export const getCityCoordinates = (cityName: string): [number, number] | null => {
  for (const county of NORWAY_COUNTIES) {
    const city = county.cities.find((c) => c.name === cityName);
    if (city && city.coordinates) {
      return city.coordinates;
    }
  }
  return null;
};
