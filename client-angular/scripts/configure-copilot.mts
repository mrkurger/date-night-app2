/**
 * @file configure-copilot.mts
 * @author mrkurger
 * @created 2025-05-21 19:55:05
 * @description Configuration script for GitHub Copilot VS Code settings
 * @version 1.0.0
 */

// Import required modules using ESM syntax with node: prefix for better performance
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// ESM compatible directory path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @interface CopilotAdvancedSettings
 * @description Type definitions for Copilot's advanced configuration options
 */
interface CopilotAdvancedSettings {
  enableDeepAnalysis: boolean;
  maxContextFiles: number;
  maxTokensPerFile: number;
}

/**
 * @interface CopilotSettings
 * @description Main Copilot configuration interface
 */
interface CopilotSettings {
  maxFilesPerBatch: number;
  batchProcessingTimeout: number;
  enableParallelProcessing: boolean;
  memoryLimit: number;
  advanced: CopilotAdvancedSettings;
}

/**
 * @interface MCPServerConfig
 * @description Configuration interface for MCP servers
 */
interface MCPServerConfig {
  maxConcurrentFiles?: number;
  timeout?: number;
  maxConcurrentOperations?: number;
}

/**
 * @interface VSCodeSettings
 * @description Complete VS Code settings structure
 */
interface VSCodeSettings {
  'github.copilot.settings': CopilotSettings;
  mcp: {
    servers: {
      'typescript-lsp': MCPServerConfig;
      sequentialthinking: MCPServerConfig;
    };
  };
  'editor.maxTokenizationLineLength': number;
  'files.maxMemoryForLargeFilesMB': number;
}

/**
 * @constant optimizedSettings
 * @description Optimized VS Code settings for improved Copilot performance
 */
const optimizedSettings: VSCodeSettings = {
  'github.copilot.settings': {
    // Increase batch size for better performance
    maxFilesPerBatch: 20,
    // Extended timeout for larger batches
    batchProcessingTimeout: 30000,
    // Enable parallel processing for better performance
    enableParallelProcessing: true,
    // Increased memory limit for larger projects
    memoryLimit: 4096,
    advanced: {
      // Enable deep analysis for better suggestions
      enableDeepAnalysis: true,
      // Increased context file limit
      maxContextFiles: 15,
      // Increased token limit per file
      maxTokensPerFile: 5000,
    },
  },
  mcp: {
    servers: {
      'typescript-lsp': {
        maxConcurrentFiles: 10,
        timeout: 30000,
      },
      sequentialthinking: {
        maxConcurrentOperations: 5,
        timeout: 30000,
      },
    },
  },
  'editor.maxTokenizationLineLength': 20000,
  'files.maxMemoryForLargeFilesMB': 4096,
};

/**
 * @function updateVSCodeSettings
 * @description Updates VS Code settings with optimized configuration
 * @returns {Promise<void>}
 * @throws {Error} If unable to write settings file
 */
const updateVSCodeSettings = async (): Promise<void> => {
  try {
    // Calculate absolute path to settings file
    const projectRoot = join(__dirname, '..', '..', '..');
    const settingsPath = join(projectRoot, '.vscode', 'settings.json');

    // Format settings with consistent indentation
    const settingsJson = JSON.stringify(optimizedSettings, null, 4);

    // Write settings file
    await writeFile(settingsPath, settingsJson, 'utf8');

    // Log success message
    console.log('✅ VS Code settings updated successfully');
    console.log('⚠️ Please restart VS Code for changes to take effect');
  } catch (error) {
    // Handle errors with detailed messages
    console.error(
      '❌ Error updating VS Code settings:',
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
};

/**
 * @function main
 * @description Main execution function using IIFE pattern
 * @returns {Promise<void>}
 */
const main = async (): Promise<void> => {
  try {
    await updateVSCodeSettings();
  } catch (error) {
    console.error('❌ Fatal error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};

// Execute main function
main();
