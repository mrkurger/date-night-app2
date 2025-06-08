#!/usr/bin/env node

/**
 * Import Path Fix Script for Travel Components
 *
 * This script specifically fixes imports for travel-related components,
 * ensuring TypeScript compatibility while preserving functionality.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.join(__dirname, '..');
const distDir = path.join(serverRoot, 'dist');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
};

console.log(`${colors.blue}🧭${colors.reset} Starting travel component fixes...`);

/**
 * Ensure directory exists
 */
async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
    return true;
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.error(
        `${colors.red}❌${colors.reset} Failed to create directory ${dir}: ${error.message}`
      );
      return false;
    }
    return true;
  }
}

/**
 * Write file with proper error handling
 */
async function writeFile(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    await ensureDir(dir);
    await fs.writeFile(filePath, content);
    console.log(
      `${colors.green}✓${colors.reset} Created file: ${path.relative(serverRoot, filePath)}`
    );
    return true;
  } catch (error) {
    console.error(
      `${colors.red}❌${colors.reset} Failed to write file ${filePath}: ${error.message}`
    );
    return false;
  }
}

/**
 * Create a proxy module to make TypeScript and JavaScript work together
 */
async function createProxyModule(sourcePath, targetPath, exportNames) {
  const isDefault = exportNames.includes('default');
  const namedExports = exportNames.filter(name => name !== 'default');

  let content = `/**
 * TypeScript compatibility proxy module
 * @generated
 */\n`;

  // Import from source
  content += `import ${isDefault ? 'defaultExport' : ''}${isDefault && namedExports.length > 0 ? ', ' : ''}${namedExports.length > 0 ? `{ ${namedExports.join(', ')} }` : ''} from '${sourcePath}';\n\n`;

  // Re-export
  if (namedExports.length > 0) {
    content += `export { ${namedExports.join(', ')} };\n`;
  }

  if (isDefault) {
    content += `export default defaultExport;\n`;
  }

  return writeFile(targetPath, content);
}

/**
 * Create the travel model stub
 */
async function createTravelModel() {
  const modelPath = path.join(distDir, 'models', 'travel.model.js');

  const content = `/**
 * TypeScript-compatible travel model stub
 */
import mongoose from 'mongoose';
import { adSchema } from './ad.model.js';

// Coordinate schema
const coordinateSchema = new mongoose.Schema(
  {
    longitude: {
      type: Number,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

// Location schema
const locationSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true,
    },
    county: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: coordinateSchema,
      required: false,
    },
  },
  { _id: false }
);

// Accommodation schema
const accommodationSchema = new mongoose.Schema(
  {
    showAccommodation: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

// Itinerary schema
const itinerarySchema = new mongoose.Schema(
  {
    destination: {
      type: locationSchema,
      required: true,
    },
    arrivalDate: {
      type: Date,
      required: true,
    },
    departureDate: {
      type: Date,
      required: true,
    },
    accommodation: {
      type: accommodationSchema,
      default: () => ({}),
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['planned', 'active', 'completed', 'cancelled'],
      default: 'planned',
    },
  },
  { timestamps: true }
);

// Add current location and touring status to ad schema
adSchema.add({
  currentLocation: {
    type: coordinateSchema,
    default: null,
  },
  isTouring: {
    type: Boolean,
    default: false,
  },
  travelItinerary: [itinerarySchema],
});

// Methods for travel features
adSchema.methods.updateLocation = function(longitude, latitude) {
  this.currentLocation = { longitude, latitude };
  this.isTouring = true;
  return this.save();
};

adSchema.methods.stopTouring = function() {
  this.isTouring = false;
  return this.save();
};

// Ensure ad model is registered with mongoose
const Ad = mongoose.models.Ad || mongoose.model('Ad', adSchema);

export { Ad, itinerarySchema, locationSchema, coordinateSchema };
export default { Ad };
`;

  return writeFile(modelPath, content);
}

/**
 * Create the travel service stub
 */
async function createTravelService() {
  const servicePath = path.join(distDir, 'services', 'travel.service.js');

  const content = `/**
 * TypeScript-compatible travel service stub
 */
import { Ad } from '../models/travel.model.js';
import { AppError } from '../middleware/error-handler.js';
import mongoose from 'mongoose';

/**
 * Travel service for managing travel-related functionality
 */
const travelService = {
  /**
   * Get all travel itineraries for an ad
   */
  async getItineraries(adId) {
    const ad = await Ad.findById(adId);
    if (!ad) {
      throw new AppError('Ad not found', 404);
    }
    return ad.travelItinerary || [];
  },

  /**
   * Add a travel itinerary to an ad
   */
  async addItinerary(adId, itineraryData, userId) {
    const ad = await Ad.findOne({ _id: adId, advertiserId: userId });
    
    if (!ad) {
      throw new AppError('Ad not found or you are not authorized', 404);
    }
    
    ad.travelItinerary.push(itineraryData);
    await ad.save();
    
    return ad;
  },

  /**
   * Update a travel itinerary
   */
  async updateItinerary(adId, itineraryId, updates, userId) {
    const ad = await Ad.findOne({ _id: adId, advertiserId: userId });
    
    if (!ad) {
      throw new AppError('Ad not found or you are not authorized', 404);
    }
    
    const itinerary = ad.travelItinerary.id(itineraryId);
    
    if (!itinerary) {
      throw new AppError('Itinerary not found', 404);
    }
    
    Object.assign(itinerary, updates);
    await ad.save();
    
    return ad;
  },

  /**
   * Cancel an itinerary
   */
  async cancelItinerary(adId, itineraryId, userId) {
    const ad = await Ad.findOne({ _id: adId, advertiserId: userId });
    
    if (!ad) {
      throw new AppError('Ad not found or you are not authorized', 404);
    }
    
    const itinerary = ad.travelItinerary.id(itineraryId);
    
    if (!itinerary) {
      throw new AppError('Itinerary not found', 404);
    }
    
    itinerary.status = 'cancelled';
    await ad.save();
    
    return ad;
  },

  /**
   * Update advertiser's current location
   */
  async updateLocation(adId, longitude, latitude, userId) {
    const ad = await Ad.findOne({ _id: adId, advertiserId: userId });
    
    if (!ad) {
      throw new AppError('Ad not found or you are not authorized', 404);
    }
    
    return ad.updateLocation(longitude, latitude);
  },

  /**
   * Find touring advertisers
   */
  async findTouringAdvertisers() {
    return Ad.find({ isTouring: true })
      .select('title description currentLocation')
      .populate('advertiserId', 'name');
  },

  /**
   * Find upcoming tours
   */
  async findUpcomingTours(city, county, daysAhead = 30) {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() + daysAhead);
    
    const query = {
      'travelItinerary.arrivalDate': { $gte: new Date(), $lte: dateLimit },
      'travelItinerary.status': 'planned',
    };
    
    if (city) {
      query['travelItinerary.destination.city'] = city;
    }
    
    if (county) {
      query['travelItinerary.destination.county'] = county;
    }
    
    return Ad.find(query)
      .select('title description travelItinerary')
      .populate('advertiserId', 'name');
  },

  /**
   * Find ads by location
   */
  async findByLocation(longitude, latitude, maxDistance = 10000) {
    return Ad.find({
      $or: [
        {
          currentLocation: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [longitude, latitude],
              },
              $maxDistance: maxDistance,
            },
          },
        },
        { isTouring: true },
      ],
    }).select('title description currentLocation isTouring');
  },
};

export default travelService;
`;

  return writeFile(servicePath, content);
}

/**
 * Execute all fixes
 */
async function main() {
  try {
    // Create compatibility proxy for travel controller
    await createProxyModule(
      '../controllers/travel.controller.js',
      path.join(distDir, 'controllers', 'travel.controller.proxy.js'),
      ['default']
    );

    // Create or update critical files
    await createTravelModel();
    await createTravelService();

    console.log(
      `${colors.green}✅${colors.reset} All travel component fixes completed successfully!`
    );
  } catch (error) {
    console.error(`${colors.red}❌${colors.reset} Travel component fixes failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();
