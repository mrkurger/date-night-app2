// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for authHelpers settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import User from '../models/user.model';

async function normalizeProfile(profile, provider) {
  let username, email;

  switch (provider) {
    case 'github':
      username = profile.username;
      email = profile.emails?.[0]?.value;
      break;
    case 'google':
      username = profile.emails?.[0]?.value?.split('@')[0];
      email = profile.emails?.[0]?.value;
      break;
    case 'reddit':
      username = profile.name;
      break;
    case 'apple':
      username = profile.email?.split('@')[0];
      email = profile.email;
      break;
  }

  return {
    username: username || `${provider}_${profile.id}`,
    email,
    provider,
  };
}

async function createUniqueUsername(baseUsername) {
  let username = baseUsername;
  let counter = 1;

  while (await User.findOne({ username })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
}

export default {
  normalizeProfile,
  createUniqueUsername,
};
