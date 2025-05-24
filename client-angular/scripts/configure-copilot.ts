/**
 * @file configure-copilot.ts
 * @description Helper script to configure GitHub Copilot settings for optimal performance
 * @created 2025-05-21 19:45:05
 * @author mrkurger
 */

import { writeFile } from 'fs/promises';
import { join } from 'path';

// Configuration interfaces
interface CopilotAdvancedSettings {
    enableDeepAnalysis: boolean;
    maxContextFiles: number;
    maxTokensPerFile: number;
}

interface CopilotSettings {
    maxFilesPerBatch: number;
    batchProcessingTimeout: number;
    enableParallelProcessing: boolean;
    memoryLimit: number;
    advanced: CopilotAdvancedSettings;
}

interface MCPServerConfig {
    maxConcurrentFiles?: number;
    timeout?: number;
    maxConcurrentOperations?: number;
}

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
 * Default optimized settings for large projects
 */
const optimizedSettings: VSCodeSettings = {
    'github.copilot.settings': {
        maxFilesPerBatch: 20,
        batchProcessingTimeout: 30000,
        enableParallelProcessing: true,
        memoryLimit: 4096,
        advanced: {
            enableDeepAnalysis: true,
            maxContextFiles: 15,
            maxTokensPerFile: 5000
        }
    },
    mcp: {
        servers: {
            'typescript-lsp': {
                maxConcurrentFiles: 10,
                timeout: 30000
            },
            sequentialthinking: {
                maxConcurrentOperations: 5,
                timeout: 30000
            }
        }
    },
    'editor.maxTokenizationLineLength': 20000,
    'files.maxMemoryForLargeFilesMB': 4096
};

/**
 * Updates VS Code settings with optimized configuration
 */
async function updateVSCodeSettings(): Promise<void> {
    try {
        const settingsPath = join(process.cwd(), '.vscode', 'settings.json');
        
        // Convert settings to formatted JSON
        const settingsJson = JSON.stringify(optimizedSettings, null, 4);
        
        // Write updated settings
        await writeFile(settingsPath, settingsJson, 'utf8');
        
        console.log('✅ VS Code settings updated successfully');
        console.log('⚠️ Please restart VS Code for changes to take effect');
    } catch (error) {
        console.error('❌ Error updating VS Code settings:', error);
        process.exit(1);
    }
}

// Execute configuration update
updateVSCodeSettings().catch(console.error);