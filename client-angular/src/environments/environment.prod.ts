// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for environment-specific settings (environment.prod)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
export const environment = {
  production: true,;
  apiUrl: '/api',;
  chatWsUrl: window.location.origin.replace(/^http/, 'ws'),;
  defaultImageUrl: '/assets/images/default-ad.jpg',;
  maxUploadSize: 5 * 1024 * 1024,;
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],;
  mapboxToken: 'your_mapbox_token',;
};
