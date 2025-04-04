const adService = require('../../services/ad.service');
const { getPaginationParams, createPaginatedResponse } = require('../../utils/pagination');

class AdController {
  // TODO: Add request validation middleware
  // TODO: Add rate limiting for ad creation
  // TODO: Add image processing and optimization
  // TODO: Add caching layer for frequently accessed ads

  async getAllAds(req, res) {
    try {
      // Get pagination parameters from request query
      const { page, limit, skip } = getPaginationParams(req.query);

      // Get filtering and sorting options from query
      const filter = {};

      // Add category filter if provided
      if (req.query.category) {
        filter.category = req.query.category;
      }

      // Add location filter if provided
      if (req.query.location) {
        filter.location = { $regex: req.query.location, $options: 'i' };
      }

      // Add price range filter if provided
      if (req.query.minPrice || req.query.maxPrice) {
        filter.price = {};
        if (req.query.minPrice) {
          filter.price.$gte = parseFloat(req.query.minPrice);
        }
        if (req.query.maxPrice) {
          filter.price.$lte = parseFloat(req.query.maxPrice);
        }
      }

      // Add search term filter if provided
      if (req.query.search) {
        filter.$or = [
          { title: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      // Define sorting options
      const sortOptions = {};

      // Set sort field and direction based on query params
      if (req.query.sortBy) {
        const sortDirection = req.query.sortDir === 'desc' ? -1 : 1;
        sortOptions[req.query.sortBy] = sortDirection;
      } else {
        // Default sort by createdAt in descending order
        sortOptions.createdAt = -1;
      }

      // Get ads with pagination
      const { ads, totalCount } = await adService.getAllAds({
        filter,
        sort: sortOptions,
        skip,
        limit
      });

      // Create paginated response
      const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
      const paginatedResponse = createPaginatedResponse(
        ads,
        totalCount,
        page,
        limit,
        baseUrl
      );

      // Set cache headers for GET requests
      res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes

      res.json(paginatedResponse);
    } catch (error) {
      console.error('Error fetching ads:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch ads',
        message: error.message
      });
    }
  }

  async getAdById(req, res) {
    try {
      const ad = await adService.getAdById(req.params.adId);
      res.json(ad);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async createAd(req, res) {
    try {
      const ad = await adService.createAd(req.body, req.user.id);
      res.status(201).json(ad);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getSwipeAds(req, res) {
    try {
      // Get pagination parameters from request query
      const { limit } = getPaginationParams(req.query);

      // Get random ads with the specified limit
      const ads = await adService.getRandomAds(limit);

      // Set cache headers with a short TTL for dynamic content
      res.set('Cache-Control', 'private, max-age=60'); // Cache for 1 minute

      res.json({
        success: true,
        data: ads
      });
    } catch (error) {
      console.error('Error fetching swipe ads:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch swipe ads',
        message: error.message
      });
    }
  }

  async getCategories(req, res) {
    try {
      const categories = await adService.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAdsByCategory(req, res) {
    try {
      const ads = await adService.getAdsByCategory(req.params.category);
      res.json(ads);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async recordSwipe(req, res) {
    try {
      await adService.recordSwipe(req.body);
      res.status(201).json({ message: 'Swipe recorded' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AdController();
