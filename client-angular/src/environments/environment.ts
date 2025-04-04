// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  chatWsUrl: 'ws://localhost:3000',
  defaultImageUrl: '/assets/images/default-ad.jpg',
  maxUploadSize: 5 * 1024 * 1024, // 5MB
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  mapboxToken: 'your_mapbox_token', // Replace with actual token if using location features
  stripePublicKey: 'pk_test_51NxSampleTestKeyDoNotUseInProductionXYZ', // Replace with actual Stripe public key in production
};