/**
 * Profile Image Utility
 * 
 * Provides consistent female profile image selection across the application.
 * Handles male profile replacement and fallback logic for missing images.
 */

// Array of available female profile images
const femaleImages: string[] = [
  '/assets/img/profiles/female-01.jpg',
  '/assets/img/profiles/female-02.jpg',
  '/assets/img/profiles/female-03.jpg',
  '/assets/img/profiles/female-04.jpg',
  '/assets/img/profiles/female-05.jpg',
  '/assets/img/profiles/female-06.jpg',
  '/assets/img/profiles/female-07.jpg',
  '/assets/img/profiles/female-08.jpg',
  '/assets/img/profiles/female-09.jpg',
  '/assets/img/profiles/female-10.jpg',
  '/assets/img/profiles/female-11.jpg',
  '/assets/img/profiles/female-12.jpg',
  '/assets/img/profiles/female-13.jpg',
  '/assets/img/profiles/female-14.jpg',
  '/assets/img/profiles/female-15.jpg',
  '/assets/img/profiles/female-16.jpg',
  '/assets/img/profiles/female-17.jpg',
  '/assets/img/profiles/female-18.jpg',
  '/assets/img/profiles/female-19.jpg',
  '/assets/img/profiles/female-20.jpg',
  '/assets/img/profiles/female-21.jpg',
  '/assets/img/profiles/female-22.jpg',
  '/assets/img/profiles/female-23.jpg',
  '/assets/img/profiles/female-24.jpg',
  '/assets/img/profiles/female-25.jpg',
  '/assets/img/profiles/female-26.jpg',
  '/assets/img/profiles/female-27.jpg',
  '/assets/img/profiles/female-28.jpg',
  '/assets/img/profiles/female-29.jpg',
];

/**
 * Get a random female profile image
 */
export function getRandomFemaleImage(): string {
  const randomIndex = Math.floor(Math.random() * femaleImages.length);
  return femaleImages[randomIndex];
}

/**
 * Get a specific female image by index
 */
export function getFemaleImageByIndex(index: number): string {
  return femaleImages[index % femaleImages.length];
}

/**
 * Get a consistent female image for a specific advertiser ID
 */
export function getFallbackFemaleImage(advertiserId?: string | number): string {
  if (advertiserId) {
    // Use advertiser ID to get consistent image for the same advertiser
    const id = typeof advertiserId === 'string' ? parseInt(advertiserId) || 0 : advertiserId;
    return getFemaleImageByIndex(id);
  }
  return getRandomFemaleImage();
}

/**
 * Enhanced utility function to get profile image with male replacement logic
 */
export function getProfileImage(advertiser: any): string {
  // Check if advertiser has a valid image and is not male
  if (
    advertiser.image &&
    advertiser.image !== '/placeholder.svg' &&
    advertiser.image !== '/assets/img/default-profile.jpg' &&
    !advertiser.image.includes('placeholder') &&
    advertiser.attributes?.gender !== 'male'
  ) {
    return advertiser.image;
  }

  // For male advertisers or missing images, return female image
  return getFallbackFemaleImage(advertiser.id || advertiser._id);
}

/**
 * Check if an image URL is valid/not a placeholder
 */
export function isValidImageUrl(imageUrl?: string): boolean {
  if (!imageUrl) return false;

  const placeholderPatterns = [
    '/placeholder.svg',
    '/assets/img/default-profile.jpg',
    '/assets/images/placeholder.jpg',
    '/assets/images/default-profile.jpg',
    'placeholder',
    'default-profile',
  ];

  return !placeholderPatterns.some(pattern => imageUrl.includes(pattern));
}

/**
 * Get profile image for ad card component
 */
export function getAdCardImage(ad: any): string {
  // Check if ad has valid images array
  if (ad.images && Array.isArray(ad.images) && ad.images.length > 0) {
    const firstImage = typeof ad.images[0] === 'string' ? ad.images[0] : ad.images[0]?.url;
    if (firstImage && isValidImageUrl(firstImage) && ad.attributes?.gender !== 'male') {
      return firstImage;
    }
  }

  // Check if ad has valid media array
  if (ad.media && Array.isArray(ad.media) && ad.media.length > 0) {
    const image = ad.media.find((m: any) => m.type === 'image');
    if (image?.url && isValidImageUrl(image.url) && ad.attributes?.gender !== 'male') {
      return image.url;
    }
  }

  // Check profileImage field
  if (ad.profileImage && isValidImageUrl(ad.profileImage) && ad.attributes?.gender !== 'male') {
    return ad.profileImage;
  }

  // For male ads or missing images, return female image
  return getFallbackFemaleImage(ad.id || ad._id);
}

export { femaleImages };
