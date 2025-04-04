export const environment = {
  production: true,
  apiUrl: '/api',
  chatWsUrl: window.location.origin.replace(/^http/, 'ws'),
  defaultImageUrl: '/assets/images/default-ad.jpg',
  maxUploadSize: 5 * 1024 * 1024,
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  mapboxToken: 'your_mapbox_token',
};