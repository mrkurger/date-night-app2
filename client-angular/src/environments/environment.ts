// This file can be replaced during build by using the `fileReplacements` array.`
// `ng build` replaces `environment.ts` with `environment.prod.ts`.`

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for the Angular client environment (development)
//
// COMMON CUSTOMIZATIONS:
// - apiUrl: Base URL for API requests (default: 'http://localhost:3000/api/v1')
//   Related to: server/config/environment.js:clientUrl
// - chatWsUrl: WebSocket URL for chat (default: 'ws://localhost:3000')
//   Related to: server/services/socket.service.js
// - socketUrl: Socket.io URL (default: 'http://localhost:3000')
//   Related to: server/server.js:io
// - maxUploadSize: Maximum file upload size in bytes (default: 5MB)
//   Related to: server/middleware/upload.js:limits
// - supportedImageTypes: Allowed image MIME types (default: ['image/jpeg', 'image/png', 'image/webp'])
//   Related to: server/middleware/upload.js:fileFilter
// - mapboxToken: API token for Mapbox integration (default: 'your_mapbox_token')
//   Valid values: A valid Mapbox API token
// - stripePublicKey: Public key for Stripe payments (default: test key)
//   Related to: server/services/payment.service.js
// - cdnUrl: CDN URL for media assets (default: '' for local development)
//   Valid values: A valid CDN URL or empty string
// - imageSizes: Responsive image size breakpoints (default: [320, 640, 960, 1280, 1920])
//   Valid values: Array of pixel dimensions
// ===================================================

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  chatWsUrl: 'ws://localhost:3000',
  socketUrl: 'http://localhost:3000',
  defaultImageUrl: '/assets/images/default-ad.jpg',
  maxUploadSize: 5 * 1024 * 1024, // 5MB
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  mapboxToken: 'your_mapbox_token', // Replace with actual token if using location features
  googleMapsApiKey: 'your_google_maps_api_key', // Replace with actual Google Maps API key if using location features
  stripePublicKey: 'pk_test_51NxSampleTestKeyDoNotUseInProductionXYZ', // Replace with actual Stripe public key in production
  cdnUrl: '', // Set to empty for local development, will use local images
  imageSizes: [320, 640, 960, 1280, 1920], // Common responsive image sizes
};
