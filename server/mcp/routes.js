/**
 * MCP Routes
 * 
 * Express router for MCP server endpoints.
 */
import express from 'express';
import { mongodbMcp } from './index.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limit for MCP API endpoints (100 requests per 15 minutes)
const mcpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiter to all MCP routes
router.use(mcpRateLimiter);

// Basic authentication middleware for MCP routes
// This is a simple implementation - replace with proper authentication in production
const authenticateMcpRequest = (req, res, next) => {
  // In production, replace this with proper auth - JWT, API key, etc.
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.MCP_API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid API key',
    });
  }
  next();
};

// Apply authentication to all MCP routes
router.use(authenticateMcpRequest);

// MCP health check endpoint - no authentication needed
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MCP servers are operational',
    timestamp: new Date().toISOString(),
  });
});

// Mount MongoDB MCP routes
router.use('/mongodb', mongodbMcp.routes);

// Handle 404 for MCP routes
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'MCP endpoint not found',
  });
});

export default router;