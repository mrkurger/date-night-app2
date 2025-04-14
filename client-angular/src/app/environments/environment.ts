// This is a copy of the main environment file for local imports
// The actual environment configuration is in /src/environments/environment.ts

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for environment-specific settings (environment)
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
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
  stripePublicKey: 'pk_test_51NxSampleTestKeyDoNotUseInProductionXYZ', // Replace with actual Stripe public key in production
  cdnUrl: '', // Set to empty for local development, will use local images
  imageSizes: [320, 640, 960, 1280, 1920], // Common responsive image sizes
};