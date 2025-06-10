#!/usr/bin/env node

/**
 * Google Cloud Function to delete Cloud Run services older than 120 minutes
 * 
 * This ESModules-based Cloud Function automatically cleans up old Cloud Run services
 * based on their DEPLOY_TIMESTAMP environment variable. Services older than 120 minutes
 * are identified and deleted to prevent resource accumulation.
 * 
 * @fileoverview Cloud Function for automated Cloud Run service cleanup
 * @author Date Night App Deployment Automation
 * @version 1.0.0
 */

import { CloudRunServiceContext } from '@google-cloud/functions-framework';
import { v2 } from '@google-cloud/run';

// Configuration constants
const CONFIG = {
  // Maximum age for Cloud Run services in minutes
  MAX_AGE_MINUTES: 120,
  
  // TODO: Replace with your Google Cloud project ID
  PROJECT_ID: process.env.GCP_PROJECT_ID || 'your-project-id',
  
  // TODO: Replace with your Cloud Run region
  REGION: process.env.CLOUD_RUN_REGION || 'us-central1',
  
  // Service name pattern to match (only delete services matching this pattern)
  SERVICE_NAME_PATTERN: process.env.SERVICE_NAME_PATTERN || 'date-night-frontend',
  
  // Whether to perform dry run (log what would be deleted without actually deleting)
  DRY_RUN: process.env.DRY_RUN === 'true',
};

/**
 * Initialize the Cloud Run client
 */
const cloudRunClient = new v2.ServicesClient();

/**
 * Parses the deployment timestamp from environment variables or labels
 * 
 * @param {Object} service - Cloud Run service object
 * @returns {Date|null} - Parsed timestamp or null if not found/invalid
 */
function parseDeploymentTimestamp(service) {
  try {
    // Try to get timestamp from environment variables first
    const envVars = service.spec?.template?.spec?.template?.spec?.containers?.[0]?.env || [];
    const deployTimestampEnv = envVars.find(env => env.name === 'DEPLOY_TIMESTAMP');
    
    if (deployTimestampEnv?.value) {
      // Expected format: runNumber-runAttempt-unixTimestamp
      const parts = deployTimestampEnv.value.split('-');
      if (parts.length >= 3) {
        const unixTimestamp = parseInt(parts[parts.length - 1]);
        if (!isNaN(unixTimestamp)) {
          return new Date(unixTimestamp * 1000);
        }
      }
    }
    
    // Fallback to labels if environment variable not found
    const labels = service.metadata?.labels || {};
    const deployTimestampLabel = labels['deploy-timestamp'];
    
    if (deployTimestampLabel) {
      const parts = deployTimestampLabel.split('-');
      if (parts.length >= 3) {
        const unixTimestamp = parseInt(parts[parts.length - 1]);
        if (!isNaN(unixTimestamp)) {
          return new Date(unixTimestamp * 1000);
        }
      }
    }
    
    // If no custom timestamp found, use the service creation time
    if (service.metadata?.creationTimestamp) {
      return new Date(service.metadata.creationTimestamp);
    }
    
    return null;
  } catch (error) {
    console.warn(`Failed to parse deployment timestamp for service ${service.metadata?.name}:`, error.message);
    return null;
  }
}

/**
 * Checks if a service is older than the configured maximum age
 * 
 * @param {Object} service - Cloud Run service object
 * @returns {boolean} - True if service should be deleted
 */
function shouldDeleteService(service) {
  const serviceName = service.metadata?.name || '';
  
  // Check if service name matches our pattern
  if (!serviceName.includes(CONFIG.SERVICE_NAME_PATTERN)) {
    console.log(`Skipping service ${serviceName} - doesn't match pattern ${CONFIG.SERVICE_NAME_PATTERN}`);
    return false;
  }
  
  // Parse the deployment timestamp
  const deploymentTime = parseDeploymentTimestamp(service);
  
  if (!deploymentTime) {
    console.warn(`No valid deployment timestamp found for service ${serviceName} - skipping`);
    return false;
  }
  
  // Calculate age in minutes
  const currentTime = new Date();
  const ageInMinutes = (currentTime.getTime() - deploymentTime.getTime()) / (1000 * 60);
  
  console.log(`Service ${serviceName} is ${ageInMinutes.toFixed(2)} minutes old`);
  
  return ageInMinutes > CONFIG.MAX_AGE_MINUTES;
}

/**
 * Deletes a Cloud Run service
 * 
 * @param {string} serviceName - Name of the service to delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
async function deleteService(serviceName) {
  try {
    const serviceFullName = `projects/${CONFIG.PROJECT_ID}/locations/${CONFIG.REGION}/services/${serviceName}`;
    
    if (CONFIG.DRY_RUN) {
      console.log(`[DRY RUN] Would delete service: ${serviceName}`);
      return true;
    }
    
    console.log(`Deleting service: ${serviceName}`);
    
    // Delete the service
    const [operation] = await cloudRunClient.deleteService({
      name: serviceFullName,
    });
    
    // Wait for the operation to complete
    const [response] = await operation.promise();
    
    console.log(`✅ Successfully deleted service: ${serviceName}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Failed to delete service ${serviceName}:`, error.message);
    return false;
  }
}

/**
 * Lists all Cloud Run services in the configured region
 * 
 * @returns {Promise<Array>} - Array of Cloud Run services
 */
async function listCloudRunServices() {
  try {
    const parent = `projects/${CONFIG.PROJECT_ID}/locations/${CONFIG.REGION}`;
    
    console.log(`Listing Cloud Run services in ${parent}...`);
    
    const [services] = await cloudRunClient.listServices({
      parent: parent,
    });
    
    console.log(`Found ${services.length} Cloud Run services`);
    return services;
    
  } catch (error) {
    console.error('Failed to list Cloud Run services:', error.message);
    throw error;
  }
}

/**
 * Main Cloud Function entry point
 * This function is triggered by Cloud Scheduler every 10 minutes
 * 
 * @param {Object} req - HTTP request object (unused for scheduled function)
 * @param {Object} res - HTTP response object
 */
export async function deleteOldCloudRunServices(req, res) {
  console.log('🧹 Starting cleanup of old Cloud Run services...');
  console.log('Configuration:', {
    projectId: CONFIG.PROJECT_ID,
    region: CONFIG.REGION,
    maxAgeMinutes: CONFIG.MAX_AGE_MINUTES,
    serviceNamePattern: CONFIG.SERVICE_NAME_PATTERN,
    dryRun: CONFIG.DRY_RUN,
  });
  
  try {
    // List all Cloud Run services
    const services = await listCloudRunServices();
    
    if (services.length === 0) {
      console.log('No Cloud Run services found');
      res.status(200).json({
        success: true,
        message: 'No services found',
        servicesProcessed: 0,
        servicesDeleted: 0,
      });
      return;
    }
    
    // Filter services that should be deleted
    const servicesToDelete = services.filter(shouldDeleteService);
    
    console.log(`Found ${servicesToDelete.length} services older than ${CONFIG.MAX_AGE_MINUTES} minutes`);
    
    if (servicesToDelete.length === 0) {
      console.log('✅ No old services to delete');
      res.status(200).json({
        success: true,
        message: 'No old services found',
        servicesProcessed: services.length,
        servicesDeleted: 0,
      });
      return;
    }
    
    // Delete each old service
    const deletionResults = await Promise.allSettled(
      servicesToDelete.map(service => deleteService(service.metadata.name))
    );
    
    // Count successful deletions
    const successfulDeletions = deletionResults.filter(result => 
      result.status === 'fulfilled' && result.value === true
    ).length;
    
    const failedDeletions = deletionResults.length - successfulDeletions;
    
    // Log summary
    console.log(`\n📊 Cleanup Summary:`);
    console.log(`- Services processed: ${services.length}`);
    console.log(`- Services identified for deletion: ${servicesToDelete.length}`);
    console.log(`- Successful deletions: ${successfulDeletions}`);
    console.log(`- Failed deletions: ${failedDeletions}`);
    
    if (CONFIG.DRY_RUN) {
      console.log('🏃 This was a dry run - no services were actually deleted');
    }
    
    // Return response
    res.status(200).json({
      success: true,
      message: 'Cleanup completed',
      servicesProcessed: services.length,
      servicesDeleted: successfulDeletions,
      servicesFailed: failedDeletions,
      dryRun: CONFIG.DRY_RUN,
    });
    
  } catch (error) {
    console.error('❌ Failed to cleanup old Cloud Run services:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to cleanup old Cloud Run services',
    });
  }
}

/**
 * Health check endpoint for the Cloud Function
 * 
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 */
export async function healthCheck(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    config: {
      projectId: CONFIG.PROJECT_ID,
      region: CONFIG.REGION,
      maxAgeMinutes: CONFIG.MAX_AGE_MINUTES,
      serviceNamePattern: CONFIG.SERVICE_NAME_PATTERN,
    },
  });
}

// Export the main function as default for Cloud Functions
export default deleteOldCloudRunServices;