// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains mobile and PWA features routes
//
// COMMON CUSTOMIZATIONS:
// - DEVICE_BREAKPOINTS: Responsive breakpoints for validation
//   Related to: server/services/mobile.service.js:validateResponsive
// ===================================================

import express from 'express';
import { MobileService } from '../services/mobile.service.js';

const router = express.Router();
const mobileService = new MobileService();

/**
 * Get mobile analytics data
 * GET /api/v1/mobile/analytics
 */
router.get('/analytics', async (req, res) => {
  try {
    const analytics = await mobileService.getMobileAnalytics();
    res.status(200).json({
      success: true,
      data: analytics,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching mobile analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mobile analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Validate responsive design
 * POST /api/v1/mobile/validate-responsive
 */
router.post('/validate-responsive', async (req, res) => {
  try {
    const { url, viewports } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required for responsive validation'
      });
    }
    
    const validation = await mobileService.validateResponsiveDesign(url, viewports);
    
    res.status(200).json({
      success: true,
      data: validation,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error validating responsive design:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate responsive design',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get PWA status and capabilities
 * GET /api/v1/mobile/pwa-status
 */
router.get('/pwa-status', async (req, res) => {
  try {
    const pwaStatus = await mobileService.getPWAStatus();
    res.status(200).json({
      success: true,
      data: pwaStatus,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching PWA status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch PWA status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Generate or update PWA manifest
 * POST /api/v1/mobile/generate-manifest
 */
router.post('/generate-manifest', async (req, res) => {
  try {
    const { config } = req.body;
    const manifest = await mobileService.generatePWAManifest(config);
    
    res.status(200).json({
      success: true,
      data: manifest,
      message: 'PWA manifest generated successfully',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error generating PWA manifest:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PWA manifest',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get device capabilities and features
 * GET /api/v1/mobile/device-capabilities
 */
router.get('/device-capabilities', async (req, res) => {
  try {
    const userAgent = req.get('User-Agent');
    const capabilities = await mobileService.getDeviceCapabilities(userAgent);
    
    res.status(200).json({
      success: true,
      data: capabilities,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching device capabilities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch device capabilities',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;