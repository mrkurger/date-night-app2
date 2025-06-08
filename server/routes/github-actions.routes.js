// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for GitHub Actions integration routes
//
// COMMON CUSTOMIZATIONS:
// - WORKFLOW_CHECK_INTERVAL: How often to check workflow status (default: 30000ms)
//   Related to: server/services/github-actions.service.js:checkWorkflows
// ===================================================

import express from 'express';
import { GitHubActionsService } from '../services/github-actions.service.js';

const router = express.Router();
const githubActionsService = new GitHubActionsService();

/**
 * Get workflow status
 * GET /api/v1/github-actions/status
 */
router.get('/status', async (req, res) => {
  try {
    const workflowStatus = await githubActionsService.getWorkflowStatus();
    res.status(200).json({
      success: true,
      data: workflowStatus,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching workflow status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workflow status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get recent workflow runs
 * GET /api/v1/github-actions/runs
 */
router.get('/runs', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const recentRuns = await githubActionsService.getRecentRuns(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: recentRuns,
      count: recentRuns.length,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching workflow runs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workflow runs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Trigger workflow dispatch
 * POST /api/v1/github-actions/trigger
 */
router.post('/trigger', async (req, res) => {
  try {
    const { workflow, inputs = {} } = req.body;
    
    if (!workflow) {
      return res.status(400).json({
        success: false,
        message: 'Workflow name is required'
      });
    }
    
    const result = await githubActionsService.triggerWorkflow(workflow, inputs);
    
    res.status(200).json({
      success: true,
      message: 'Workflow triggered successfully',
      data: result,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error triggering workflow:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger workflow',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get deployment status
 * GET /api/v1/github-actions/deployments
 */
router.get('/deployments', async (req, res) => {
  try {
    const deployments = await githubActionsService.getDeploymentStatus();
    
    res.status(200).json({
      success: true,
      data: deployments,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching deployment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deployment status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;