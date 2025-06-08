// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains developer tools and system monitoring routes
//
// COMMON CUSTOMIZATIONS:
// - BUILD_TIMEOUT: Maximum time to wait for build completion (default: 300000ms)
//   Related to: server/services/dev-tools.service.js:runBuild
// ===================================================

import express from 'express';
import { DevToolsService } from '../services/dev-tools.service.js';

const router = express.Router();
const devToolsService = new DevToolsService();

/**
 * Get system health and build status
 * GET /api/v1/dev-tools/health
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = await devToolsService.getSystemHealth();
    res.status(200).json({
      success: true,
      data: healthStatus,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system health',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get build status and history
 * GET /api/v1/dev-tools/build-status
 */
router.get('/build-status', async (req, res) => {
  try {
    const buildStatus = await devToolsService.getBuildStatus();
    res.status(200).json({
      success: true,
      data: buildStatus,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching build status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch build status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Trigger build process
 * POST /api/v1/dev-tools/build
 */
router.post('/build', async (req, res) => {
  try {
    const { target = 'all', clean = false } = req.body;
    
    const buildResult = await devToolsService.triggerBuild(target, clean);
    
    res.status(200).json({
      success: true,
      data: buildResult,
      message: 'Build process initiated',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error triggering build:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger build',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get dependency analysis
 * GET /api/v1/dev-tools/dependencies
 */
router.get('/dependencies', async (req, res) => {
  try {
    const dependencies = await devToolsService.analyzeDependencies();
    res.status(200).json({
      success: true,
      data: dependencies,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error analyzing dependencies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze dependencies',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get performance metrics
 * GET /api/v1/dev-tools/performance
 */
router.get('/performance', async (req, res) => {
  try {
    const performance = await devToolsService.getPerformanceMetrics();
    res.status(200).json({
      success: true,
      data: performance,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance metrics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Run development task
 * POST /api/v1/dev-tools/task
 */
router.post('/task', async (req, res) => {
  try {
    const { taskName, parameters = {} } = req.body;
    
    if (!taskName) {
      return res.status(400).json({
        success: false,
        message: 'Task name is required'
      });
    }
    
    const taskResult = await devToolsService.runTask(taskName, parameters);
    
    res.status(200).json({
      success: true,
      data: taskResult,
      message: `Task ${taskName} completed`,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error running task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;