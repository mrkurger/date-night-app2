#!/usr/bin/env node

/**
 * Feature Documentation Generator
 *
 * This script generates feature documentation files from the template.
 * It can create documentation for all features or a specific feature.
 *
 * Usage:
 *   node generate_feature_docs.js [feature-name]
 *
 * If no feature name is provided, it will generate documentation for all features
 * that don't already have documentation.
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define paths - ES module compatible way
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const FEATURES_DIR = path.join(DOCS_DIR, 'features');
const TEMPLATE_PATH = path.join(DOCS_DIR, 'FEATURE_DOCUMENTATION_TEMPLATE.md');
const CLIENT_FEATURES_DIR = path.join(ROOT_DIR, 'client-angular/src/app/features');
const SERVER_COMPONENTS_DIR = path.join(ROOT_DIR, 'server/components');

// Ensure features directory exists
if (!fs.existsSync(FEATURES_DIR)) {
  fs.mkdirSync(FEATURES_DIR, { recursive: true });
}

// Helper functions
function getFeatureNames() {
  let clientFeatures = [];
  let serverFeatures = [];

  // Get client features
  if (fs.existsSync(CLIENT_FEATURES_DIR)) {
    try {
      clientFeatures = fs.readdirSync(CLIENT_FEATURES_DIR).filter(file => {
        try {
          return fs.statSync(path.join(CLIENT_FEATURES_DIR, file)).isDirectory();
        } catch (error) {
          console.warn(
            `Warning: Could not access ${path.join(CLIENT_FEATURES_DIR, file)}: ${error.message}`
          );
          return false;
        }
      });
    } catch (error) {
      console.warn(`Warning: Could not read client features directory: ${error.message}`);
    }
  } else {
    console.warn(`Warning: Client features directory does not exist: ${CLIENT_FEATURES_DIR}`);
  }

  // Get server features
  if (fs.existsSync(SERVER_COMPONENTS_DIR)) {
    try {
      serverFeatures = fs.readdirSync(SERVER_COMPONENTS_DIR).filter(file => {
        try {
          return fs.statSync(path.join(SERVER_COMPONENTS_DIR, file)).isDirectory();
        } catch (error) {
          console.warn(
            `Warning: Could not access ${path.join(SERVER_COMPONENTS_DIR, file)}: ${error.message}`
          );
          return false;
        }
      });
    } catch (error) {
      console.warn(`Warning: Could not read server components directory: ${error.message}`);
    }
  } else {
    console.warn(`Warning: Server components directory does not exist: ${SERVER_COMPONENTS_DIR}`);
  }

  // Combine and deduplicate
  return [...new Set([...clientFeatures, ...serverFeatures])];
}

function getExistingFeatureDocs() {
  if (!fs.existsSync(FEATURES_DIR)) {
    return [];
  }

  try {
    return fs
      .readdirSync(FEATURES_DIR)
      .filter(file => file.endsWith('.md') || file.endsWith('.MD'))
      .map(file => file.replace(/\.md$/i, '').toLowerCase());
  } catch (error) {
    console.warn(`Warning: Could not read features directory: ${error.message}`);
    return [];
  }
}

function generateFeatureDoc(featureName) {
  const featureNameUpper = featureName.toUpperCase();
  const outputPath = path.join(FEATURES_DIR, `${featureNameUpper}.md`);

  try {
    // Check if documentation already exists
    if (fs.existsSync(outputPath)) {
      console.log(`Documentation for ${featureName} already exists at ${outputPath}`);
      return false;
    }

    // Read template
    let template;
    try {
      template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
    } catch (error) {
      console.error(`Error reading template file: ${error.message}`);
      return false;
    }

    // Replace placeholders with feature-specific content
    let content = template
      .replace(/Feature Name/g, toTitleCase(featureName))
      .replace(/feature-name/g, featureName.toLowerCase())
      .replace(/FeatureComponent/g, `${toTitleCase(featureName)}Component`)
      .replace(/FeatureService/g, `${toTitleCase(featureName)}Service`)
      .replace(/FeatureModel/g, `${toTitleCase(featureName)}Model`)
      .replace(/\/features\//g, `/features/${featureName.toLowerCase()}/`)
      .replace(/\/api\/v1\/features/g, `/api/v1/${featureName.toLowerCase()}s`);

    // Write to file
    try {
      fs.writeFileSync(outputPath, content);
      console.log(`Generated documentation for ${featureName} at ${outputPath}`);
      return true;
    } catch (error) {
      console.error(`Error writing documentation file: ${error.message}`);
      return false;
    }
  } catch (error) {
    console.error(`Error generating documentation for ${featureName}: ${error.message}`);
    return false;
  }
}

function toTitleCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const specificFeature = args[0];

  console.log('Feature Documentation Generator');
  console.log('==============================');

  // Check if template exists
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error(`Error: Template file not found at ${TEMPLATE_PATH}`);
    process.exit(1);
  }

  if (specificFeature) {
    // Generate documentation for a specific feature
    console.log(`Generating documentation for feature: ${specificFeature}`);
    generateFeatureDoc(specificFeature);
  } else {
    // Generate documentation for all features that don't have it yet
    console.log('Generating documentation for all features without existing documentation...');

    const allFeatures = getFeatureNames();
    const existingDocs = getExistingFeatureDocs();
    const featuresToDocument = allFeatures.filter(
      feature => !existingDocs.includes(feature.toLowerCase())
    );

    console.log(
      `Found ${allFeatures.length} features, ${existingDocs.length} with existing documentation.`
    );
    console.log(`Will generate documentation for ${featuresToDocument.length} features.`);

    if (featuresToDocument.length === 0) {
      console.log('All features already have documentation.');
      return;
    }

    let generatedCount = 0;
    featuresToDocument.forEach(feature => {
      if (generateFeatureDoc(feature)) {
        generatedCount++;
      }
    });

    console.log(`\nGenerated documentation for ${generatedCount} features.`);
  }
}

main();
