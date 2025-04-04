const Ad = require('../models/ad.model');
const User = require('../models/user.model');
const { AppError } = require('../middleware/errorHandler');
const socketService = require('./socket.service');

class TravelService {
  /**
   * Get all travel itineraries for an ad
   * @param {string} adId - Ad ID
   * @returns {Promise<Array>} Array of travel itineraries
   */
  async getItineraries(adId) {
    try {
      const ad = await Ad.findById(adId);
      
      if (!ad) {
        throw new AppError('Ad not found', 404);
      }
      
      return ad.travelItinerary || [];
    } catch (error) {
      console.error('Error getting travel itineraries:', error);
      throw new AppError(error.message || 'Failed to get travel itineraries', 500);
    }
  }

  /**
   * Add a travel itinerary to an ad
   * @param {string} adId - Ad ID
   * @param {Object} itineraryData - Itinerary data
   * @param {string} userId - User ID (must be the advertiser)
   * @returns {Promise<Object>} Updated ad
   */
  async addItinerary(adId, itineraryData, userId) {
    try {
      const ad = await Ad.findById(adId).populate('advertiser');
      
      if (!ad) {
        throw new AppError('Ad not found', 404);
      }
      
      // Check if user is the advertiser
      if (ad.advertiser._id.toString() !== userId) {
        throw new AppError('You are not authorized to update this ad', 403);
      }
      
      // Add itinerary
      await ad.addTravelItinerary(itineraryData);
      
      // Notify followers if any
      this.notifyFollowers(ad._id, ad.advertiser.username, itineraryData);
      
      return ad;
    } catch (error) {
      console.error('Error adding travel itinerary:', error);
      throw new AppError(error.message || 'Failed to add travel itinerary', 500);
    }
  }

  /**
   * Update a travel itinerary
   * @param {string} adId - Ad ID
   * @param {string} itineraryId - Itinerary ID
   * @param {Object} updates - Updates to apply
   * @param {string} userId - User ID (must be the advertiser)
   * @returns {Promise<Object>} Updated ad
   */
  async updateItinerary(adId, itineraryId, updates, userId) {
    try {
      const ad = await Ad.findById(adId);
      
      if (!ad) {
        throw new AppError('Ad not found', 404);
      }
      
      // Check if user is the advertiser
      if (ad.advertiser.toString() !== userId) {
        throw new AppError('You are not authorized to update this ad', 403);
      }
      
      // Update itinerary
      await ad.updateTravelItinerary(itineraryId, updates);
      
      // If status changed to active, notify followers
      if (updates.status === 'active') {
        const itinerary = ad.travelItinerary.id(itineraryId);
        const advertiser = await User.findById(ad.advertiser);
        this.notifyFollowers(ad._id, advertiser.username, itinerary);
      }
      
      return ad;
    } catch (error) {
      console.error('Error updating travel itinerary:', error);
      throw new AppError(error.message || 'Failed to update travel itinerary', 500);
    }
  }

  /**
   * Cancel a travel itinerary
   * @param {string} adId - Ad ID
   * @param {string} itineraryId - Itinerary ID
   * @param {string} userId - User ID (must be the advertiser)
   * @returns {Promise<Object>} Updated ad
   */
  async cancelItinerary(adId, itineraryId, userId) {
    try {
      const ad = await Ad.findById(adId);
      
      if (!ad) {
        throw new AppError('Ad not found', 404);
      }
      
      // Check if user is the advertiser
      if (ad.advertiser.toString() !== userId) {
        throw new AppError('You are not authorized to update this ad', 403);
      }
      
      // Get itinerary before cancelling for notification
      const itinerary = ad.travelItinerary.id(itineraryId);
      
      if (!itinerary) {
        throw new AppError('Itinerary not found', 404);
      }
      
      // Cancel itinerary
      await ad.cancelTravelItinerary(itineraryId);
      
      // Notify followers about cancellation
      const advertiser = await User.findById(ad.advertiser);
      this.notifyCancellation(ad._id, advertiser.username, itinerary);
      
      return ad;
    } catch (error) {
      console.error('Error cancelling travel itinerary:', error);
      throw new AppError(error.message || 'Failed to cancel travel itinerary', 500);
    }
  }

  /**
   * Update advertiser's current location
   * @param {string} adId - Ad ID
   * @param {number} longitude - Longitude
   * @param {number} latitude - Latitude
   * @param {string} userId - User ID (must be the advertiser)
   * @returns {Promise<Object>} Updated ad
   */
  async updateLocation(adId, longitude, latitude, userId) {
    try {
      const ad = await Ad.findById(adId);
      
      if (!ad) {
        throw new AppError('Ad not found', 404);
      }
      
      // Check if user is the advertiser
      if (ad.advertiser.toString() !== userId) {
        throw new AppError('You are not authorized to update this ad', 403);
      }
      
      // Update location
      await ad.updateCurrentLocation(longitude, latitude);
      
      return ad;
    } catch (error) {
      console.error('Error updating location:', error);
      throw new AppError(error.message || 'Failed to update location', 500);
    }
  }

  /**
   * Find touring advertisers
   * @returns {Promise<Array>} Array of ads
   */
  async findTouringAdvertisers() {
    try {
      return await Ad.findTouring()
        .populate('advertiser', 'username profileImage')
        .sort('-createdAt');
    } catch (error) {
      console.error('Error finding touring advertisers:', error);
      throw new AppError(error.message || 'Failed to find touring advertisers', 500);
    }
  }

  /**
   * Find upcoming tours
   * @param {string} city - Optional city filter
   * @param {string} county - Optional county filter
   * @param {number} daysAhead - Days ahead to look (default: 30)
   * @returns {Promise<Array>} Array of ads
   */
  async findUpcomingTours(city = null, county = null, daysAhead = 30) {
    try {
      return await Ad.findUpcomingTours(city, county, daysAhead)
        .populate('advertiser', 'username profileImage')
        .sort('travelItinerary.arrivalDate');
    } catch (error) {
      console.error('Error finding upcoming tours:', error);
      throw new AppError(error.message || 'Failed to find upcoming tours', 500);
    }
  }

  /**
   * Find ads by location (including touring advertisers)
   * @param {number} longitude - Longitude
   * @param {number} latitude - Latitude
   * @param {number} maxDistance - Max distance in meters (default: 10000)
   * @returns {Promise<Array>} Array of ads
   */
  async findByLocation(longitude, latitude, maxDistance = 10000) {
    try {
      return await Ad.findByCurrentLocation(longitude, latitude, maxDistance)
        .populate('advertiser', 'username profileImage')
        .sort('-featured -boosted -createdAt');
    } catch (error) {
      console.error('Error finding ads by location:', error);
      throw new AppError(error.message || 'Failed to find ads by location', 500);
    }
  }

  /**
   * Notify followers about new or updated travel itinerary
   * @param {string} adId - Ad ID
   * @param {string} advertiserName - Advertiser username
   * @param {Object} itinerary - Itinerary data
   */
  async notifyFollowers(adId, advertiserName, itinerary) {
    try {
      // Find users who follow this advertiser
      const followers = await User.find({
        'following.advertiser': adId
      });
      
      if (followers.length === 0) {
        return;
      }
      
      const arrivalDate = new Date(itinerary.arrivalDate).toLocaleDateString();
      const departureDate = new Date(itinerary.departureDate).toLocaleDateString();
      
      const notification = {
        type: 'ad',
        message: `${advertiserName} will be in ${itinerary.destination.city} from ${arrivalDate} to ${departureDate}`,
        data: {
          adId,
          itineraryId: itinerary._id,
          destination: itinerary.destination.city,
          arrivalDate: itinerary.arrivalDate,
          departureDate: itinerary.departureDate
        }
      };
      
      // Send notification to each follower
      followers.forEach(follower => {
        socketService.sendNotification(follower._id.toString(), notification);
      });
    } catch (error) {
      console.error('Error notifying followers:', error);
    }
  }

  /**
   * Notify followers about cancelled travel itinerary
   * @param {string} adId - Ad ID
   * @param {string} advertiserName - Advertiser username
   * @param {Object} itinerary - Itinerary data
   */
  async notifyCancellation(adId, advertiserName, itinerary) {
    try {
      // Find users who follow this advertiser
      const followers = await User.find({
        'following.advertiser': adId
      });
      
      if (followers.length === 0) {
        return;
      }
      
      const arrivalDate = new Date(itinerary.arrivalDate).toLocaleDateString();
      const departureDate = new Date(itinerary.departureDate).toLocaleDateString();
      
      const notification = {
        type: 'ad',
        message: `${advertiserName} has cancelled their trip to ${itinerary.destination.city} (${arrivalDate} - ${departureDate})`,
        data: {
          adId,
          itineraryId: itinerary._id,
          destination: itinerary.destination.city,
          cancelled: true
        }
      };
      
      // Send notification to each follower
      followers.forEach(follower => {
        socketService.sendNotification(follower._id.toString(), notification);
      });
    } catch (error) {
      console.error('Error notifying followers about cancellation:', error);
    }
  }
}

module.exports = new TravelService();