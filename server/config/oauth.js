// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for configuration settings (oauth)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import { createCallbackUrl } from '../utils/urlHelpers.js';

const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';

export default {
  github: {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: createCallbackUrl(serverUrl, 'github'),
  },
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: createCallbackUrl(serverUrl, 'google'),
  },
  // Reddit OAuth removed
  apple: {
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    keyID: process.env.APPLE_KEY_ID,
    callbackURL: createCallbackUrl(serverUrl, 'apple'),
    privateKeyLocation: process.env.APPLE_PRIVATE_KEY_LOCATION,
  },
};
