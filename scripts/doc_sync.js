#!/usr/bin/env node

/**
 * Documentation Synchronization System
 * 
 * This script automatically detects code changes and updates documentation accordingly.
 * It's designed to run as part of the CI/CD pipeline to maintain documentation freshness.
 * 
 * Features:
 * - Detects new/modified code files (excluding client-angular/)
 * - Updates or creates corresponding documentation
 * - Updates the knowledge graph with every change
 * - Archives outdated documentation
 * 
 * @author Documentation Control System
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuration for the documentation synchronization system
 */
const config = {
  rootDir: path.resolve(__dirname, '..'),
  
  // Directories to monitor for changes (excluding client-angular)
  monitoredDirs: [
    'server',
    'client_angular2',
    'scripts',
    'prisma',
    '.github'
  ],
  
  // Documentation directories
  docDirs: {
    main: 'docs',
    graph: 'docs/graph',
    archive: 'docs/outdated'
  },
  
  // Patterns to exclude from monitoring
  excludePatterns: [
    'node_modules/',
    '.git/',
    'client-angular/', // Explicitly excluded per requirements
    'logs/',
    'coverage/',
    'dist/',
    'build/',
    '.next/',
    'temp/',
    'tmp/'
  ],
  
  // File extensions that require documentation
  documentableExtensions: ['.js', '.ts', '.jsx', '.tsx'],
  
  // Knowledge graph file path
  knowledgeGraphPath: 'docs/graph/ci_knowledge.md'
};

/**
 * Detects changes in the repository since the last run
 * @param {string} since - Git reference to compare against (default: 'HEAD~1')
 * @returns {Object} Object containing changed files categorized by type
 */
function detectChanges(since = 'HEAD~1') {
  try {
    console.log(`🔍 Detecting changes since ${since}...`);
    
    // Get changed files using git
    const gitCommand = `git diff --name-status ${since} HEAD`;
    const gitOutput = execSync(gitCommand, { encoding: 'utf8', cwd: config.rootDir });
    
    const changes = {
      added: [],
      modified: [],
      deleted: [],
      renamed: []
    };
    
    if (!gitOutput.trim()) {
      console.log('ℹ️  No changes detected');
      return changes;
    }
    
    const lines = gitOutput.trim().split('\n');
    
    for (const line of lines) {
      const [status, ...fileParts] = line.split('\t');
      const filePath = fileParts.join('\t');
      
      // Skip excluded patterns
      const shouldExclude = config.excludePatterns.some(pattern => 
        filePath.includes(pattern)
      );
      
      if (shouldExclude) {
        continue;
      }
      
      // Only include monitored directories
      const isMonitored = config.monitoredDirs.some(dir => 
        filePath.startsWith(dir + '/')
      );
      
      if (!isMonitored) {
        continue;
      }
      
      switch (status) {
        case 'A':
          changes.added.push(filePath);
          break;
        case 'M':
          changes.modified.push(filePath);
          break;
        case 'D':
          changes.deleted.push(filePath);
          break;
        case 'R':
          changes.renamed.push(filePath);
          break;
      }
    }
    
    console.log(`📊 Changes detected:`);
    console.log(`  ➕ Added: ${changes.added.length}`);
    console.log(`  📝 Modified: ${changes.modified.length}`);
    console.log(`  🗑️  Deleted: ${changes.deleted.length}`);
    console.log(`  📋 Renamed: ${changes.renamed.length}`);
    
    return changes;
    
  } catch (error) {
    console.error('❌ Error detecting changes:', error.message);
    return { added: [], modified: [], deleted: [], renamed: [] };
  }
}

/**
 * Generates documentation for a code file
 * @param {string} filePath - Path to the code file
 * @returns {string} Generated documentation content
 */
function generateDocumentationForFile(filePath) {
  try {
    const content = fs.readFileSync(path.join(config.rootDir, filePath), 'utf8');
    const fileName = path.basename(filePath, path.extname(filePath));
    const fileExt = path.extname(filePath);
    
    // Basic documentation template
    let documentation = `# ${fileName} Documentation

**File**: \`${filePath}\`  
**Type**: ${getFileType(filePath)}  
**Last Updated**: ${new Date().toISOString()}

## Overview

TODO: Add description of what this ${getFileType(filePath)} does.

`;

    // Analyze file content to extract key information
    const analysis = analyzeFileContent(content, fileExt);
    
    if (analysis.exports.length > 0) {
      documentation += `## Exports

`;
      for (const exportItem of analysis.exports) {
        documentation += `### ${exportItem.name}

**Type**: ${exportItem.type}

TODO: Document the purpose and usage of ${exportItem.name}.

`;
      }
    }
    
    if (analysis.imports.length > 0) {
      documentation += `## Dependencies

`;
      for (const importItem of analysis.imports) {
        documentation += `- \`${importItem}\`\n`;
      }
      documentation += '\n';
    }
    
    if (analysis.functions.length > 0) {
      documentation += `## Functions

`;
      for (const func of analysis.functions) {
        documentation += `### ${func.name}

TODO: Document this function.

\`\`\`${fileExt.slice(1)}
${func.signature}
\`\`\`

`;
      }
    }
    
    documentation += `## Usage

TODO: Add usage examples and integration instructions.

## Testing

TODO: Document testing approach and test cases.

## Related Files

TODO: Link to related components, services, or documentation.

---
*This documentation was auto-generated by the Documentation Control System*
`;
    
    return documentation;
    
  } catch (error) {
    console.error(`❌ Error generating documentation for ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Determines the type of file based on its path and content
 * @param {string} filePath - Path to the file
 * @returns {string} File type description
 */
function getFileType(filePath) {
  const fileName = path.basename(filePath).toLowerCase();
  const dirPath = path.dirname(filePath).toLowerCase();
  
  if (fileName.includes('component')) return 'Component';
  if (fileName.includes('service')) return 'Service';
  if (fileName.includes('controller')) return 'Controller';
  if (fileName.includes('model')) return 'Model';
  if (fileName.includes('route')) return 'Route Handler';
  if (fileName.includes('middleware')) return 'Middleware';
  if (fileName.includes('util')) return 'Utility';
  if (fileName.includes('config')) return 'Configuration';
  if (fileName.includes('test') || fileName.includes('spec')) return 'Test';
  if (dirPath.includes('component')) return 'Component';
  if (dirPath.includes('service')) return 'Service';
  if (dirPath.includes('controller')) return 'Controller';
  if (dirPath.includes('model')) return 'Model';
  if (dirPath.includes('route')) return 'Route Handler';
  if (dirPath.includes('middleware')) return 'Middleware';
  if (dirPath.includes('hook')) return 'React Hook';
  
  return 'Module';
}

/**
 * Analyzes file content to extract structural information
 * @param {string} content - File content
 * @param {string} fileExt - File extension
 * @returns {Object} Analysis results
 */
function analyzeFileContent(content, fileExt) {
  const analysis = {
    exports: [],
    imports: [],
    functions: [],
    classes: []
  };
  
  // TODO: Implement more sophisticated content analysis
  // This is a basic implementation that can be enhanced
  
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Extract imports
    if (trimmedLine.startsWith('import ') || trimmedLine.startsWith('const ') && trimmedLine.includes('require(')) {
      const importMatch = trimmedLine.match(/import.*from ['"](.+)['"]/) || 
                         trimmedLine.match(/require\(['"](.+)['"]\)/);
      if (importMatch) {
        analysis.imports.push(importMatch[1]);
      }
    }
    
    // Extract exports
    if (trimmedLine.startsWith('export ')) {
      const exportMatch = trimmedLine.match(/export\s+(const|function|class|default)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
      if (exportMatch) {
        analysis.exports.push({
          name: exportMatch[2],
          type: exportMatch[1]
        });
      }
    }
    
    // Extract function definitions
    if (trimmedLine.includes('function ') || trimmedLine.match(/const\s+\w+\s*=\s*\(/)) {
      const funcMatch = trimmedLine.match(/(?:function\s+|const\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)/);
      if (funcMatch) {
        analysis.functions.push({
          name: funcMatch[1],
          signature: trimmedLine
        });
      }
    }
  }
  
  return analysis;
}

/**
 * Updates or creates documentation for changed files
 * @param {Object} changes - Detected changes object
 * @returns {Array} Array of documentation actions taken
 */
function updateDocumentation(changes) {
  const actions = [];
  
  // Process added files
  for (const filePath of changes.added) {
    if (config.documentableExtensions.includes(path.extname(filePath))) {
      const docPath = generateDocumentationPath(filePath);
      const docContent = generateDocumentationForFile(filePath);
      
      if (docContent) {
        const fullDocPath = path.join(config.rootDir, docPath);
        fs.mkdirSync(path.dirname(fullDocPath), { recursive: true });
        fs.writeFileSync(fullDocPath, docContent);
        
        actions.push({
          type: 'created',
          file: filePath,
          documentation: docPath
        });
        
        console.log(`📝 Created documentation: ${docPath}`);
      }
    }
  }
  
  // Process modified files
  for (const filePath of changes.modified) {
    if (config.documentableExtensions.includes(path.extname(filePath))) {
      const docPath = generateDocumentationPath(filePath);
      const fullDocPath = path.join(config.rootDir, docPath);
      
      if (fs.existsSync(fullDocPath)) {
        // Update existing documentation
        updateExistingDocumentation(fullDocPath, filePath);
        
        actions.push({
          type: 'updated',
          file: filePath,
          documentation: docPath
        });
        
        console.log(`🔄 Updated documentation: ${docPath}`);
      } else {
        // Create new documentation if it doesn't exist
        const docContent = generateDocumentationForFile(filePath);
        
        if (docContent) {
          fs.mkdirSync(path.dirname(fullDocPath), { recursive: true });
          fs.writeFileSync(fullDocPath, docContent);
          
          actions.push({
            type: 'created',
            file: filePath,
            documentation: docPath
          });
          
          console.log(`📝 Created documentation: ${docPath}`);
        }
      }
    }
  }
  
  // Process deleted files
  for (const filePath of changes.deleted) {
    const docPath = generateDocumentationPath(filePath);
    const fullDocPath = path.join(config.rootDir, docPath);
    
    if (fs.existsSync(fullDocPath)) {
      // Archive instead of delete
      archiveDocumentation(fullDocPath, filePath);
      
      actions.push({
        type: 'archived',
        file: filePath,
        documentation: docPath
      });
      
      console.log(`🗄️  Archived documentation: ${docPath}`);
    }
  }
  
  return actions;
}

/**
 * Generates the documentation file path for a given code file
 * @param {string} filePath - Path to the code file
 * @returns {string} Path where documentation should be created
 */
function generateDocumentationPath(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  const dirPath = path.dirname(filePath);
  
  // Create documentation path mirroring the code structure
  return path.join(config.docDirs.main, 'auto-generated', dirPath, `${fileName}.md`);
}

/**
 * Updates existing documentation with new timestamp and change notice
 * @param {string} docPath - Path to the documentation file
 * @param {string} codePath - Path to the changed code file
 */
function updateExistingDocumentation(docPath, codePath) {
  try {
    let content = fs.readFileSync(docPath, 'utf8');
    
    // Update the last updated timestamp
    const timestampRegex = /\*\*Last Updated\*\*: .+/;
    const newTimestamp = `**Last Updated**: ${new Date().toISOString()}`;
    
    if (timestampRegex.test(content)) {
      content = content.replace(timestampRegex, newTimestamp);
    } else {
      // Add timestamp if it doesn't exist
      content = content.replace(
        /^(# .+ Documentation)/m,
        `$1\n\n**File**: \`${codePath}\`  \n${newTimestamp}`
      );
    }
    
    // Add change notice
    const changeNotice = `\n\n> ⚠️ **Note**: This file was recently modified. Please review and update the documentation accordingly.\n`;
    
    if (!content.includes('recently modified')) {
      content = content.replace(
        /^## Overview/m,
        `${changeNotice}\n## Overview`
      );
    }
    
    fs.writeFileSync(docPath, content);
    
  } catch (error) {
    console.error(`❌ Error updating documentation ${docPath}:`, error.message);
  }
}

/**
 * Archives documentation for deleted files
 * @param {string} docPath - Path to the documentation file
 * @param {string} codePath - Path to the deleted code file
 */
function archiveDocumentation(docPath, codePath) {
  try {
    const archiveDir = path.join(config.rootDir, config.docDirs.archive);
    fs.mkdirSync(archiveDir, { recursive: true });
    
    const fileName = path.basename(docPath);
    const archivePath = path.join(archiveDir, `${Date.now()}-${fileName}`);
    
    // Add archive notice to the documentation
    let content = fs.readFileSync(docPath, 'utf8');
    content = `> **ARCHIVED**: This documentation is for a deleted file (\`${codePath}\`) and has been archived on ${new Date().toISOString()}\n\n` + content;
    
    fs.writeFileSync(archivePath, content);
    fs.unlinkSync(docPath); // Remove from main docs
    
  } catch (error) {
    console.error(`❌ Error archiving documentation ${docPath}:`, error.message);
  }
}

/**
 * Updates the knowledge graph with the latest changes
 * @param {Array} actions - Documentation actions taken
 * @param {Object} changes - Detected changes
 */
function updateKnowledgeGraph(actions, changes) {
  try {
    console.log('🧠 Updating knowledge graph...');
    
    const knowledgeGraphPath = path.join(config.rootDir, config.knowledgeGraphPath);
    
    if (!fs.existsSync(knowledgeGraphPath)) {
      console.log('⚠️  Knowledge graph not found, creating new one...');
      // TODO: Initialize knowledge graph
      return;
    }
    
    let graphContent = fs.readFileSync(knowledgeGraphPath, 'utf8');
    
    // Update timestamp
    const timestamp = new Date().toISOString();
    graphContent = graphContent.replace(
      /\*\*Last Updated\*\*: .+/,
      `**Last Updated**: ${timestamp}`
    );
    
    // Update sync timestamp in metadata
    graphContent = graphContent.replace(
      /"last_updated": ".+"/,
      `"last_updated": "${timestamp}"`
    );
    
    // Add change summary
    const changeSummary = `
## Recent Changes (${timestamp})

**Files Changed**: ${changes.added.length + changes.modified.length + changes.deleted.length}
- Added: ${changes.added.length}
- Modified: ${changes.modified.length}  
- Deleted: ${changes.deleted.length}

**Documentation Actions**: ${actions.length}
- Created: ${actions.filter(a => a.type === 'created').length}
- Updated: ${actions.filter(a => a.type === 'updated').length}
- Archived: ${actions.filter(a => a.type === 'archived').length}

`;
    
    // Insert change summary after the repository context section
    graphContent = graphContent.replace(
      /(## Repository Context[\s\S]*?)\n(## Code Structure Overview)/,
      `$1\n${changeSummary}\n$2`
    );
    
    fs.writeFileSync(knowledgeGraphPath, graphContent);
    console.log('✅ Knowledge graph updated');
    
  } catch (error) {
    console.error('❌ Error updating knowledge graph:', error.message);
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting Documentation Synchronization...');
    
    // Detect changes
    const changes = detectChanges();
    
    if (changes.added.length === 0 && changes.modified.length === 0 && changes.deleted.length === 0) {
      console.log('ℹ️  No relevant changes detected. Documentation is up to date.');
      return;
    }
    
    // Update documentation
    const actions = updateDocumentation(changes);
    
    // Update knowledge graph
    updateKnowledgeGraph(actions, changes);
    
    console.log('✅ Documentation synchronization complete!');
    console.log(`📊 Summary: ${actions.length} documentation actions completed`);
    
  } catch (error) {
    console.error('❌ Error during documentation synchronization:', error);
    process.exit(1);
  }
}

// Execute the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { detectChanges, updateDocumentation, updateKnowledgeGraph };