// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains mobile and PWA services
//
// COMMON CUSTOMIZATIONS:
// - DEFAULT_VIEWPORTS: Standard viewport sizes for testing
//   Related to: mobile.routes.js:MobileService
// ===================================================

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Service for mobile and PWA functionality
 */
export class MobileService {
  constructor() {
    this.defaultViewports = [
      { name: 'Mobile Portrait', width: 375, height: 667 },
      { name: 'Mobile Landscape', width: 667, height: 375 },
      { name: 'Tablet Portrait', width: 768, height: 1024 },
      { name: 'Tablet Landscape', width: 1024, height: 768 },
      { name: 'Desktop', width: 1200, height: 800 }
    ];
  }

  /**
   * Get mobile analytics data
   */
  async getMobileAnalytics() {
    try {
      // In a real implementation, this would connect to analytics services
      // For now, return mock data structure
      return {
        mobile_users_percentage: 65.4,
        device_breakdown: {
          mobile: 65.4,
          tablet: 18.2,
          desktop: 16.4
        },
        top_mobile_devices: [
          { device: 'iPhone 14', percentage: 22.1 },
          { device: 'Samsung Galaxy S23', percentage: 18.3 },
          { device: 'iPhone 13', percentage: 15.7 },
          { device: 'iPad Air', percentage: 12.4 },
          { device: 'Pixel 7', percentage: 8.9 }
        ],
        performance_metrics: {
          average_load_time_mobile: 2.3,
          average_load_time_desktop: 1.8,
          bounce_rate_mobile: 35.2,
          bounce_rate_desktop: 28.7
        },
        last_updated: new Date()
      };
    } catch (error) {
      console.error('Error getting mobile analytics:', error);
      throw error;
    }
  }

  /**
   * Validate responsive design
   */
  async validateResponsiveDesign(url, customViewports = null) {
    try {
      const viewports = customViewports || this.defaultViewports;
      const results = [];

      for (const viewport of viewports) {
        // In a real implementation, this would use a headless browser
        // For now, return mock validation results
        const result = {
          viewport: viewport,
          status: 'passed',
          issues: [],
          score: Math.floor(Math.random() * 20) + 80, // Random score 80-100
          recommendations: []
        };

        // Add some mock issues for demonstration
        if (viewport.width < 400) {
          result.issues.push({
            type: 'layout',
            severity: 'medium',
            description: 'Text may be too small on very narrow screens',
            element: 'body'
          });
        }

        if (viewport.width > 1200) {
          result.recommendations.push({
            type: 'optimization',
            description: 'Consider using larger images for high-resolution displays'
          });
        }

        results.push(result);
      }

      return {
        url: url,
        tested_viewports: viewports.length,
        overall_score: results.reduce((acc, r) => acc + r.score, 0) / results.length,
        results: results,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error validating responsive design:', error);
      throw error;
    }
  }

  /**
   * Get PWA status and capabilities
   */
  async getPWAStatus() {
    try {
      const clientPath = path.join(__dirname, '../../client-angular');
      
      // Check for manifest.json
      let hasManifest = false;
      let manifestData = null;
      try {
        const manifestPath = path.join(clientPath, 'src/manifest.json');
        const manifestContent = await fs.readFile(manifestPath, 'utf8');
        manifestData = JSON.parse(manifestContent);
        hasManifest = true;
      } catch (error) {
        // Manifest doesn't exist or is invalid
      }

      // Check for service worker
      let hasServiceWorker = false;
      try {
        const swPath = path.join(clientPath, 'src/sw.js');
        await fs.access(swPath);
        hasServiceWorker = true;
      } catch (error) {
        // Service worker doesn't exist
      }

      // Calculate PWA readiness score
      let score = 0;
      const checks = [];

      if (hasManifest) {
        score += 40;
        checks.push({ name: 'Web App Manifest', status: 'passed', weight: 40 });
      } else {
        checks.push({ name: 'Web App Manifest', status: 'failed', weight: 40 });
      }

      if (hasServiceWorker) {
        score += 30;
        checks.push({ name: 'Service Worker', status: 'passed', weight: 30 });
      } else {
        checks.push({ name: 'Service Worker', status: 'failed', weight: 30 });
      }

      // Check for HTTPS (in production)
      const hasHTTPS = process.env.NODE_ENV === 'production';
      if (hasHTTPS || process.env.NODE_ENV === 'development') {
        score += 20;
        checks.push({ name: 'HTTPS/Secure Context', status: 'passed', weight: 20 });
      } else {
        checks.push({ name: 'HTTPS/Secure Context', status: 'failed', weight: 20 });
      }

      // Check for responsive design
      score += 10; // Assume responsive (could be validated)
      checks.push({ name: 'Responsive Design', status: 'passed', weight: 10 });

      return {
        is_pwa_ready: score >= 90,
        readiness_score: score,
        has_manifest: hasManifest,
        has_service_worker: hasServiceWorker,
        manifest_data: manifestData,
        checks: checks,
        recommendations: this.getPWARecommendations(score, checks),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error getting PWA status:', error);
      throw error;
    }
  }

  /**
   * Generate PWA recommendations
   */
  getPWARecommendations(score, checks) {
    const recommendations = [];

    const failedChecks = checks.filter(check => check.status === 'failed');
    
    if (failedChecks.some(check => check.name === 'Web App Manifest')) {
      recommendations.push({
        priority: 'high',
        action: 'Create a web app manifest file',
        description: 'Add manifest.json with app metadata for installability'
      });
    }

    if (failedChecks.some(check => check.name === 'Service Worker')) {
      recommendations.push({
        priority: 'high',
        action: 'Implement a service worker',
        description: 'Add offline capabilities and background sync'
      });
    }

    if (score < 70) {
      recommendations.push({
        priority: 'medium',
        action: 'Improve PWA compliance',
        description: 'Address failed checks to enhance user experience'
      });
    }

    return recommendations;
  }

  /**
   * Generate PWA manifest
   */
  async generatePWAManifest(config = {}) {
    try {
      const defaultManifest = {
        name: config.name || 'Date Night App',
        short_name: config.short_name || 'DateNight',
        description: config.description || 'Find and plan amazing date nights',
        start_url: config.start_url || '/',
        display: config.display || 'standalone',
        theme_color: config.theme_color || '#1976d2',
        background_color: config.background_color || '#ffffff',
        orientation: config.orientation || 'portrait-primary',
        scope: config.scope || '/',
        icons: config.icons || [
          {
            src: 'assets/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: 'assets/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: 'assets/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'assets/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: 'assets/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: 'assets/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'assets/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'assets/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      };

      // Write manifest to client-angular/src directory
      const clientPath = path.join(__dirname, '../../client-angular/src');
      const manifestPath = path.join(clientPath, 'manifest.json');
      
      await fs.writeFile(manifestPath, JSON.stringify(defaultManifest, null, 2));

      return defaultManifest;
    } catch (error) {
      console.error('Error generating PWA manifest:', error);
      throw error;
    }
  }

  /**
   * Get device capabilities based on user agent
   */
  async getDeviceCapabilities(userAgent) {
    try {
      // Basic device detection (in production, use a proper library)
      const isMobile = /Mobile|Android|iP(hone|od|ad)|BlackBerry|IEMobile/.test(userAgent);
      const isTablet = /iPad|Android(?!.*Mobile)/.test(userAgent);
      const isIOS = /iPhone|iPad|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);

      return {
        device_type: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
        is_mobile: isMobile,
        is_tablet: isTablet,
        is_desktop: !isMobile && !isTablet,
        platform: {
          is_ios: isIOS,
          is_android: isAndroid,
          is_windows: /Windows/.test(userAgent),
          is_mac: /Macintosh/.test(userAgent)
        },
        capabilities: {
          // These would be detected through feature detection in a real app
          supports_pwa: true,
          supports_notifications: true,
          supports_geolocation: true,
          supports_camera: isMobile || isTablet,
          supports_offline: true,
          supports_background_sync: true
        },
        user_agent: userAgent,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error getting device capabilities:', error);
      throw error;
    }
  }
}