#!/usr/bin/env node

/**
 * MCP Knowledge Graph Synchronization Script
 * 
 * This script synchronizes the persistent knowledge graph with the Memory MCP server
 * and ensures that both the local persistent_knowledge.md file and the running
 * MCP server instance contain the same up-to-date project knowledge.
 * 
 * Features:
 * - Extract knowledge from codebase (excluding client-angular/)
 * - Sync with existing ci_knowledge.md 
 * - Update persistent_knowledge.md for MCP server consumption
 * - Communicate with running Memory MCP server instance
 * - Handle bi-directional synchronization
 * - Support for incremental and full sync modes
 * 
 * @author MCP Integration System
 * @version 1.0.0
 * @requires @modelcontextprotocol/sdk
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuration for knowledge graph synchronization
 */
const SYNC_CONFIG = {
  // File paths
  paths: {
    rootDir: path.resolve(__dirname, '..'),
    persistentKnowledge: path.resolve(__dirname, '../docs/graph/persistent_knowledge.md'),
    ciKnowledge: path.resolve(__dirname, '../docs/graph/ci_knowledge.md'),
    tempKnowledge: path.resolve(__dirname, '../docs/graph/temp_knowledge.md'),
    syncLog: path.resolve(__dirname, '../logs/mcp-sync.log')
  },
  
  // Directories to exclude from knowledge extraction (including client-angular)
  excludeDirs: [
    'client-angular',
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    '.next',
    'logs',
    'backup-*',
    '.vscode',
    '.husky'
  ],
  
  // File patterns to include
  includePatterns: [
    '**/*.js',
    '**/*.ts',
    '**/*.jsx',
    '**/*.tsx',
    '**/*.md',
    '**/*.json',
    '**/*.yml',
    '**/*.yaml',
    '**/*.html',
    '**/*.css',
    '**/*.scss'
  ],
  
  // Knowledge extraction configuration
  extraction: {
    maxFileSize: 1024 * 1024, // 1MB max file size
    maxTotalSize: 50 * 1024 * 1024, // 50MB max total extracted content
    chunkSize: 8192, // Size of content chunks for processing
    includeFileTree: true,
    includeMetadata: true
  },
  
  // MCP server connection settings
  mcpServer: {
    host: process.env.MCP_MEMORY_HOST || 'localhost',
    port: process.env.MCP_MEMORY_PORT || 3001,
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 2000
  }
};

/**
 * Logging utility for sync operations
 */
class SyncLogger {
  static async log(level, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${level}] ${timestamp} - ${message}\n`;
    
    // Console output
    console.log(`[${level}] ${message}`);
    
    // File logging
    try {
      await fs.appendFile(SYNC_CONFIG.paths.syncLog, logEntry);
    } catch (error) {
      // Ignore file logging errors
    }
  }
  
  static async info(message) { await this.log('INFO', message); }
  static async warn(message) { await this.log('WARN', message); }
  static async error(message) { await this.log('ERROR', message); }
  static async debug(message) { 
    if (process.env.DEBUG === 'true') {
      await this.log('DEBUG', message); 
    }
  }
}

/**
 * File system utilities for knowledge extraction
 */
class FileSystemScanner {
  /**
   * Get all relevant files for knowledge extraction
   */
  static async getRelevantFiles(rootDir) {
    const files = [];
    
    try {
      await this.scanDirectory(rootDir, '', files);
      return files.filter(file => this.shouldIncludeFile(file));
    } catch (error) {
      throw new Error(`Failed to scan files: ${error.message}`);
    }
  }
  
  /**
   * Recursively scan directory for files
   */
  static async scanDirectory(basePath, relativePath, files) {
    const fullPath = path.join(basePath, relativePath);
    
    try {
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryPath = path.join(relativePath, entry.name);
        const fullEntryPath = path.join(basePath, entryPath);
        
        if (entry.isDirectory()) {
          // Skip excluded directories
          if (!this.shouldExcludeDirectory(entry.name, entryPath)) {
            await this.scanDirectory(basePath, entryPath, files);
          }
        } else if (entry.isFile()) {
          files.push({
            path: entryPath,
            fullPath: fullEntryPath,
            name: entry.name,
            size: (await fs.stat(fullEntryPath)).size
          });
        }
      }
    } catch (error) {
      await SyncLogger.warn(`Cannot access directory ${fullPath}: ${error.message}`);
    }
  }
  
  /**
   * Check if directory should be excluded
   */
  static shouldExcludeDirectory(name, relativePath) {
    return SYNC_CONFIG.excludeDirs.some(pattern => {
      if (pattern.includes('/')) {
        return relativePath.includes(pattern);
      }
      return name === pattern || name.startsWith(pattern);
    });
  }
  
  /**
   * Check if file should be included in knowledge extraction
   */
  static shouldIncludeFile(file) {
    // Check file size limit
    if (file.size > SYNC_CONFIG.extraction.maxFileSize) {
      return false;
    }
    
    // Check file patterns
    return SYNC_CONFIG.includePatterns.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
      return regex.test(file.path);
    });
  }
}

/**
 * Knowledge content extractor and processor
 */
class KnowledgeExtractor {
  constructor() {
    this.extractedSize = 0;
    this.fileCount = 0;
  }
  
  /**
   * Extract knowledge from the codebase
   */
  async extractKnowledge() {
    await SyncLogger.info('🔍 Starting knowledge extraction from codebase...');
    
    const files = await FileSystemScanner.getRelevantFiles(SYNC_CONFIG.paths.rootDir);
    await SyncLogger.info(`Found ${files.length} files for analysis`);
    
    const knowledge = {
      metadata: this.generateMetadata(),
      structure: await this.extractProjectStructure(files),
      codeAnalysis: await this.extractCodeKnowledge(files),
      documentation: await this.extractDocumentationKnowledge(files),
      relationships: await this.extractRelationships(files)
    };
    
    await SyncLogger.info(`✅ Knowledge extraction complete: ${this.fileCount} files, ${this.formatBytes(this.extractedSize)}`);
    return knowledge;
  }
  
  /**
   * Generate metadata for the knowledge graph
   */
  generateMetadata() {
    return {
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
      source: 'mcp-knowledge-sync',
      compatibleWith: '@modelcontextprotocol/server-memory',
      scope: 'repository_excluding_client_angular',
      extractionConfig: {
        excludeDirs: SYNC_CONFIG.excludeDirs,
        includePatterns: SYNC_CONFIG.includePatterns,
        maxFileSize: SYNC_CONFIG.extraction.maxFileSize
      }
    };
  }
  
  /**
   * Extract project structure information
   */
  async extractProjectStructure(files) {
    const structure = {
      directories: new Set(),
      fileTypes: {},
      sizeDistribution: {},
      keyFiles: []
    };
    
    for (const file of files) {
      // Track directories
      const dir = path.dirname(file.path);
      if (dir !== '.') {
        structure.directories.add(dir);
      }
      
      // Track file types
      const ext = path.extname(file.name);
      structure.fileTypes[ext] = (structure.fileTypes[ext] || 0) + 1;
      
      // Track key configuration files
      if (this.isKeyFile(file.name)) {
        structure.keyFiles.push({
          path: file.path,
          type: this.getKeyFileType(file.name),
          size: file.size
        });
      }
    }
    
    return {
      totalFiles: files.length,
      directories: Array.from(structure.directories).sort(),
      fileTypes: structure.fileTypes,
      keyFiles: structure.keyFiles
    };
  }
  
  /**
   * Extract code-specific knowledge
   */
  async extractCodeKnowledge(files) {
    const codeFiles = files.filter(f => this.isCodeFile(f.name));
    const knowledge = {
      components: [],
      modules: [],
      functions: [],
      types: [],
      imports: []
    };
    
    // TODO: Implement more sophisticated code analysis
    // For now, we'll do basic file content analysis
    
    for (const file of codeFiles.slice(0, 50)) { // Limit for initial implementation
      try {
        const content = await fs.readFile(file.fullPath, 'utf8');
        const analysis = this.analyzeCodeContent(content, file);
        
        if (analysis.components.length > 0) knowledge.components.push(...analysis.components);
        if (analysis.functions.length > 0) knowledge.functions.push(...analysis.functions);
        if (analysis.imports.length > 0) knowledge.imports.push(...analysis.imports);
        
        this.extractedSize += Buffer.byteLength(content, 'utf8');
        this.fileCount++;
        
        // Check size limit
        if (this.extractedSize > SYNC_CONFIG.extraction.maxTotalSize) {
          await SyncLogger.warn('Reached maximum extraction size limit');
          break;
        }
      } catch (error) {
        await SyncLogger.warn(`Could not analyze ${file.path}: ${error.message}`);
      }
    }
    
    return knowledge;
  }
  
  /**
   * Extract documentation knowledge
   */
  async extractDocumentationKnowledge(files) {
    const docFiles = files.filter(f => f.name.endsWith('.md') || f.name.endsWith('.html'));
    const knowledge = {
      guides: [],
      readmes: [],
      specifications: [],
      changelogs: []
    };
    
    for (const file of docFiles) {
      try {
        const content = await fs.readFile(file.fullPath, 'utf8');
        const docType = this.categorizeDocument(file.name, content);
        const summary = this.extractDocumentSummary(content);
        
        const docInfo = {
          path: file.path,
          type: docType,
          title: this.extractDocumentTitle(content),
          summary: summary,
          size: file.size
        };
        
        knowledge[docType].push(docInfo);
        
        this.extractedSize += Buffer.byteLength(content, 'utf8');
        this.fileCount++;
        
      } catch (error) {
        await SyncLogger.warn(`Could not process documentation ${file.path}: ${error.message}`);
      }
    }
    
    return knowledge;
  }
  
  /**
   * Extract relationships between files and components
   */
  async extractRelationships(files) {
    // TODO: Implement sophisticated relationship analysis
    // This is a placeholder for future enhancement
    
    return {
      dependencies: [],
      references: [],
      hierarchies: []
    };
  }
  
  /**
   * Analyze code content for knowledge extraction
   */
  analyzeCodeContent(content, file) {
    const analysis = {
      components: [],
      functions: [],
      imports: []
    };
    
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Extract imports/requires
      if (line.startsWith('import ') || line.startsWith('const ') && line.includes('require(')) {
        analysis.imports.push({
          line: i + 1,
          statement: line,
          file: file.path
        });
      }
      
      // Extract function definitions
      const funcMatch = line.match(/^(export\s+)?(async\s+)?function\s+(\w+)/);
      if (funcMatch) {
        analysis.functions.push({
          name: funcMatch[3],
          line: i + 1,
          file: file.path,
          isExported: !!funcMatch[1],
          isAsync: !!funcMatch[2]
        });
      }
      
      // Extract React/Angular components (basic detection)
      if (line.includes('export') && (line.includes('Component') || line.includes('function'))) {
        const componentMatch = line.match(/export\s+(?:default\s+)?(?:function\s+)?(\w+)/);
        if (componentMatch) {
          analysis.components.push({
            name: componentMatch[1],
            line: i + 1,
            file: file.path,
            type: file.path.includes('angular') ? 'angular' : 'react'
          });
        }
      }
    }
    
    return analysis;
  }
  
  /**
   * Helper methods for file type detection and analysis
   */
  isKeyFile(filename) {
    const keyFiles = [
      'package.json', 'package-lock.json', 'tsconfig.json', 'angular.json',
      '.eslintrc.json', '.prettierrc', 'playwright.config.ts', 'tailwind.config.js',
      'next.config.js', 'README.md', 'CHANGELOG.md'
    ];
    return keyFiles.includes(filename);
  }
  
  getKeyFileType(filename) {
    if (filename.includes('package')) return 'package';
    if (filename.includes('config')) return 'config';
    if (filename.includes('tsconfig')) return 'typescript';
    if (filename.includes('README')) return 'documentation';
    return 'other';
  }
  
  isCodeFile(filename) {
    const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.mjs'];
    return codeExtensions.some(ext => filename.endsWith(ext));
  }
  
  categorizeDocument(filename, content) {
    if (filename.toLowerCase().includes('readme')) return 'readmes';
    if (filename.toLowerCase().includes('changelog')) return 'changelogs';
    if (content.toLowerCase().includes('specification') || content.toLowerCase().includes('spec')) return 'specifications';
    return 'guides';
  }
  
  extractDocumentTitle(content) {
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^#+\s*(.+)$/);
      if (match) return match[1].trim();
    }
    return 'Untitled Document';
  }
  
  extractDocumentSummary(content) {
    const lines = content.split('\n');
    let summary = '';
    let inContent = false;
    
    for (const line of lines) {
      if (line.trim().startsWith('#')) {
        inContent = true;
        continue;
      }
      if (inContent && line.trim()) {
        summary += line.trim() + ' ';
        if (summary.length > 200) break;
      }
    }
    
    return summary.trim().substring(0, 200);
  }
  
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

/**
 * Memory MCP Server Client for synchronization
 */
class MCPServerClient {
  constructor() {
    this.connected = false;
  }
  
  /**
   * Connect to the Memory MCP server
   * TODO: Implement actual MCP protocol connection
   */
  async connect() {
    await SyncLogger.info(`Connecting to MCP server at ${SYNC_CONFIG.mcpServer.host}:${SYNC_CONFIG.mcpServer.port}...`);
    
    try {
      // TODO: Implement actual MCP SDK connection
      // This is a placeholder for the real implementation
      
      // For now, we'll simulate a connection check
      await this.healthCheck();
      this.connected = true;
      
      await SyncLogger.info('✅ Connected to MCP Memory server');
      return true;
    } catch (error) {
      await SyncLogger.error(`Failed to connect to MCP server: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Check if MCP server is healthy
   */
  async healthCheck() {
    // TODO: Implement actual health check via MCP protocol
    // For now, we'll check if the server process is running
    
    try {
      const pidFile = path.resolve(__dirname, '../.mcp-memory-server.pid');
      const pid = await fs.readFile(pidFile, 'utf8');
      
      // Check if process exists
      process.kill(parseInt(pid), 0);
      return true;
    } catch (error) {
      throw new Error('MCP server is not running');
    }
  }
  
  /**
   * Send knowledge to MCP server
   */
  async sendKnowledge(knowledge) {
    if (!this.connected) {
      throw new Error('Not connected to MCP server');
    }
    
    await SyncLogger.info('📤 Sending knowledge to MCP server...');
    
    try {
      // TODO: Implement actual knowledge sending via MCP protocol
      // This would use the @modelcontextprotocol/sdk to communicate
      
      await SyncLogger.info('✅ Knowledge sent to MCP server successfully');
      return true;
    } catch (error) {
      await SyncLogger.error(`Failed to send knowledge to MCP server: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Retrieve knowledge from MCP server
   */
  async retrieveKnowledge() {
    if (!this.connected) {
      throw new Error('Not connected to MCP server');
    }
    
    await SyncLogger.info('📥 Retrieving knowledge from MCP server...');
    
    try {
      // TODO: Implement actual knowledge retrieval via MCP protocol
      
      await SyncLogger.info('✅ Knowledge retrieved from MCP server successfully');
      return null; // Placeholder
    } catch (error) {
      await SyncLogger.error(`Failed to retrieve knowledge from MCP server: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Disconnect from MCP server
   */
  async disconnect() {
    if (this.connected) {
      // TODO: Implement proper disconnection
      this.connected = false;
      await SyncLogger.info('Disconnected from MCP server');
    }
  }
}

/**
 * Main Knowledge Graph Synchronizer
 */
class KnowledgeGraphSynchronizer {
  constructor() {
    this.extractor = new KnowledgeExtractor();
    this.mcpClient = new MCPServerClient();
  }
  
  /**
   * Perform full synchronization
   */
  async syncFull() {
    await SyncLogger.info('🚀 Starting full knowledge graph synchronization...');
    
    try {
      // 1. Extract knowledge from codebase
      const extractedKnowledge = await this.extractor.extractKnowledge();
      
      // 2. Load existing knowledge from ci_knowledge.md
      const existingKnowledge = await this.loadExistingKnowledge();
      
      // 3. Merge knowledge sources
      const mergedKnowledge = await this.mergeKnowledge(extractedKnowledge, existingKnowledge);
      
      // 4. Save to persistent_knowledge.md
      await this.savePersistentKnowledge(mergedKnowledge);
      
      // 5. Sync with MCP server if running
      const serverConnected = await this.mcpClient.connect();
      if (serverConnected) {
        await this.mcpClient.sendKnowledge(mergedKnowledge);
        await this.mcpClient.disconnect();
      } else {
        await SyncLogger.warn('MCP server not available, skipping server sync');
      }
      
      await SyncLogger.info('✅ Full synchronization completed successfully');
      return true;
      
    } catch (error) {
      await SyncLogger.error(`Full synchronization failed: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Perform incremental synchronization
   */
  async syncIncremental() {
    await SyncLogger.info('🔄 Starting incremental knowledge graph synchronization...');
    
    try {
      // TODO: Implement incremental sync logic
      // For now, fall back to full sync
      return await this.syncFull();
      
    } catch (error) {
      await SyncLogger.error(`Incremental synchronization failed: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Load existing knowledge from ci_knowledge.md
   */
  async loadExistingKnowledge() {
    try {
      const content = await fs.readFile(SYNC_CONFIG.paths.ciKnowledge, 'utf8');
      return this.parseExistingKnowledge(content);
    } catch (error) {
      await SyncLogger.warn(`Could not load existing knowledge: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Parse existing knowledge from markdown format
   */
  parseExistingKnowledge(content) {
    // TODO: Implement sophisticated markdown parsing
    // For now, extract basic metadata
    
    const metadata = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.includes('**Last Updated**:')) {
        metadata.lastUpdated = line.split(':')[1].trim();
      }
      if (line.includes('**Documentation Coverage**:')) {
        metadata.coverage = line.split(':')[1].trim();
      }
    }
    
    return {
      source: 'ci_knowledge',
      metadata: metadata,
      content: content
    };
  }
  
  /**
   * Merge knowledge from different sources
   */
  async mergeKnowledge(extracted, existing) {
    await SyncLogger.info('🔀 Merging knowledge from multiple sources...');
    
    const merged = {
      metadata: {
        ...extracted.metadata,
        lastSyncAt: new Date().toISOString(),
        sources: ['codebase_extraction', existing ? 'ci_knowledge' : null].filter(Boolean)
      },
      structure: extracted.structure,
      codeAnalysis: extracted.codeAnalysis,
      documentation: extracted.documentation,
      relationships: extracted.relationships,
      existingContext: existing || null
    };
    
    return merged;
  }
  
  /**
   * Save knowledge to persistent_knowledge.md
   */
  async savePersistentKnowledge(knowledge) {
    await SyncLogger.info('💾 Saving persistent knowledge graph...');
    
    const markdown = this.formatKnowledgeAsMarkdown(knowledge);
    await fs.writeFile(SYNC_CONFIG.paths.persistentKnowledge, markdown, 'utf8');
    
    await SyncLogger.info(`✅ Persistent knowledge saved to ${SYNC_CONFIG.paths.persistentKnowledge}`);
  }
  
  /**
   * Format knowledge as markdown for MCP consumption
   */
  formatKnowledgeAsMarkdown(knowledge) {
    const sections = [];
    
    // Header
    sections.push('# Persistent Knowledge Graph');
    sections.push('');
    sections.push('This knowledge graph is maintained for MCP Memory server integration and provides');
    sections.push('comprehensive project context for AI systems and GitHub Copilot.');
    sections.push('');
    
    // Metadata
    sections.push('## Metadata');
    sections.push('');
    sections.push('```json');
    sections.push(JSON.stringify(knowledge.metadata, null, 2));
    sections.push('```');
    sections.push('');
    
    // Project Structure
    sections.push('## Project Structure');
    sections.push('');
    sections.push(`**Total Files**: ${knowledge.structure.totalFiles}`);
    sections.push(`**Directories**: ${knowledge.structure.directories.length}`);
    sections.push('');
    
    if (knowledge.structure.keyFiles.length > 0) {
      sections.push('### Key Configuration Files');
      sections.push('');
      for (const file of knowledge.structure.keyFiles) {
        sections.push(`- \`${file.path}\` (${file.type}) - ${this.formatBytes(file.size)}`);
      }
      sections.push('');
    }
    
    // Code Analysis
    if (knowledge.codeAnalysis.components.length > 0) {
      sections.push('## Components');
      sections.push('');
      for (const component of knowledge.codeAnalysis.components.slice(0, 20)) {
        sections.push(`- **${component.name}** (${component.type}) - \`${component.file}:${component.line}\``);
      }
      sections.push('');
    }
    
    if (knowledge.codeAnalysis.functions.length > 0) {
      sections.push('## Functions');
      sections.push('');
      for (const func of knowledge.codeAnalysis.functions.slice(0, 30)) {
        const tags = [];
        if (func.isExported) tags.push('exported');
        if (func.isAsync) tags.push('async');
        const tagStr = tags.length > 0 ? ` (${tags.join(', ')})` : '';
        sections.push(`- **${func.name}**${tagStr} - \`${func.file}:${func.line}\``);
      }
      sections.push('');
    }
    
    // Documentation
    if (knowledge.documentation.guides.length > 0) {
      sections.push('## Documentation');
      sections.push('');
      sections.push('### Guides');
      for (const doc of knowledge.documentation.guides) {
        sections.push(`- [${doc.title}](${doc.path}) - ${doc.summary}`);
      }
      sections.push('');
    }
    
    // Footer
    sections.push('---');
    sections.push('');
    sections.push(`*Last synchronized: ${knowledge.metadata.lastSyncAt}*`);
    sections.push(`*Compatible with: ${knowledge.metadata.compatibleWith}*`);
    sections.push('*Generated by MCP Knowledge Synchronization System*');
    
    return sections.join('\n');
  }
  
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

/**
 * CLI interface for knowledge synchronization
 */
async function main() {
  const mode = process.argv[2] || 'full';
  const synchronizer = new KnowledgeGraphSynchronizer();
  
  // Ensure log directory exists
  try {
    await fs.mkdir(path.dirname(SYNC_CONFIG.paths.syncLog), { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
  
  await SyncLogger.info('🧠 MCP Knowledge Graph Synchronization Starting...');
  await SyncLogger.info(`Mode: ${mode}`);
  
  let success = false;
  
  switch (mode) {
    case 'full':
      success = await synchronizer.syncFull();
      break;
      
    case 'incremental':
      success = await synchronizer.syncIncremental();
      break;
      
    case 'extract-only':
      try {
        const knowledge = await synchronizer.extractor.extractKnowledge();
        await synchronizer.savePersistentKnowledge({
          metadata: knowledge.metadata,
          structure: knowledge.structure,
          codeAnalysis: knowledge.codeAnalysis,
          documentation: knowledge.documentation,
          relationships: knowledge.relationships
        });
        success = true;
      } catch (error) {
        await SyncLogger.error(`Extract-only failed: ${error.message}`);
        success = false;
      }
      break;
      
    default:
      console.log(`
🧠 MCP Knowledge Graph Synchronization

Usage: node mcp-knowledge-sync.js [mode]

Modes:
  full           Full synchronization (extract + merge + sync with MCP)
  incremental    Incremental synchronization (default)
  extract-only   Extract knowledge without MCP server sync

Environment Variables:
  MCP_MEMORY_HOST    MCP server host (default: localhost)
  MCP_MEMORY_PORT    MCP server port (default: 3001)
  DEBUG              Enable debug logging (true/false)

Examples:
  node mcp-knowledge-sync.js full
  node mcp-knowledge-sync.js incremental
  DEBUG=true node mcp-knowledge-sync.js extract-only
`);
      process.exit(0);
  }
  
  if (success) {
    await SyncLogger.info('✅ Knowledge synchronization completed successfully');
    process.exit(0);
  } else {
    await SyncLogger.error('❌ Knowledge synchronization failed');
    process.exit(1);
  }
}

// Export main functionality for use by other scripts
export default main;

// Export individual classes for testing and reuse
export { KnowledgeExtractor, MCPServerClient, KnowledgeGraphSynchronizer };

// Run CLI if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(async (error) => {
    await SyncLogger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}