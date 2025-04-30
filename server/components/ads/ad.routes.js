// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (ad.routes)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import express from 'express';
const router = express.Router();
import adController from './ad.controller.js';

/**
 * @swagger
 * tags:
 *   name: Ads
 *   description: Advertisement management
 */

/**
 * @swagger
 * /api/v1/ads:
 *   get:
 *     summary: Get all ads
 *     description: Retrieve a list of all ads with optional filtering and pagination
 *     tags: [Ads]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for title and description
 *     responses:
 *       200:
 *         description: A paginated list of ads
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ad'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', adController.getAllAds);

/**
 * @swagger
 * /api/v1/ads/{adId}:
 *   get:
 *     summary: Get ad by ID
 *     description: Retrieve a specific ad by its ID
 *     tags: [Ads]
 *     parameters:
 *       - in: path
 *         name: adId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ad to retrieve
 *     responses:
 *       200:
 *         description: Ad details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ad'
 *       404:
 *         description: Ad not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:adId', adController.getAdById);

/**
 * @swagger
 * /api/v1/ads:
 *   post:
 *     summary: Create a new ad
 *     description: Create a new advertisement
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Sofia - 25 - Escort"
 *               description:
 *                 type: string
 *                 example: "Professional and discreet service. Available for outcalls and incalls."
 *               contact:
 *                 type: string
 *                 example: "+47 123 45 678"
 *               location:
 *                 type: string
 *                 example: "Oslo"
 *               category:
 *                 type: string
 *                 example: "Escort"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["GFE", "Dinner Date", "Overnight"]
 *     responses:
 *       201:
 *         description: Ad created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ad'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', adController.createAd);

/**
 * @swagger
 * /api/v1/ads/swipe:
 *   get:
 *     summary: Get ads for swipe interface
 *     description: Retrieve a random set of ads for the swipe interface
 *     tags: [Ads]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of ads to retrieve
 *     responses:
 *       200:
 *         description: A list of random ads
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ad'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/swipe', adController.getSwipeAds);

/**
 * @swagger
 * /api/v1/ads/categories:
 *   get:
 *     summary: Get all ad categories
 *     description: Retrieve a list of all available ad categories
 *     tags: [Ads]
 *     responses:
 *       200:
 *         description: A list of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["Escort", "Massage", "Striptease"]
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/categories', adController.getCategories);

/**
 * @swagger
 * /api/v1/ads/category/{category}:
 *   get:
 *     summary: Get ads by category
 *     description: Retrieve all ads in a specific category
 *     tags: [Ads]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Category name
 *     responses:
 *       200:
 *         description: A list of ads in the specified category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ad'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/category/:category', adController.getAdsByCategory);

/**
 * @swagger
 * /api/v1/ads/swipes:
 *   post:
 *     summary: Record a swipe action
 *     description: Record a left or right swipe on an ad
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adId
 *               - direction
 *             properties:
 *               adId:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *               direction:
 *                 type: string
 *                 enum: [left, right]
 *                 example: "right"
 *     responses:
 *       201:
 *         description: Swipe recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Swipe recorded"
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/swipes', adController.recordSwipe);

export default router;
