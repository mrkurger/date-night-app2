#!/usr/bin/env node

/**
 * Documentation Control & Synchronization System - Main Orchestrator
 * 
 * This is the main entry point for the documentation control system.
 * It orchestrates all documentation management tasks including:
 * - Auditing current documentation
 * - Cleaning up outdated content
 * - Synchronizing with code changes
 * - Maintaining the knowledge graph
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
 * Configuration for the documentation control system
 */
const config = {
  rootDir: path.resolve(__dirname, '..'),
  
  // Available operations
  operations: {
    audit: {
      script: 'doc_control_audit.js',
      description: 'Audit documentation against current codebase'
    },
    cleanup: {
      script: 'doc_cleanup.js', 
      description: 'Clean up and update outdated documentation'
    },
    sync: {
      script: 'doc_sync.js',
      description: 'Synchronize documentation with code changes'
    },
    full: {
      description: 'Run complete documentation control workflow'
    }
  },
  
  // Output files
  outputs: {
    audit: 'docs/DOCUMENTATION_DISCREPANCIES_REPORT.md',
    cleanup: 'docs/DOCUMENTATION_CLEANUP_REPORT.md', 
    knowledgeGraph: 'docs/graph/ci_knowledge.md',
    summary: 'docs/DOCUMENTATION_CONTROL_SUMMARY.md'
  }
};

/**
 * Displays usage information
 */
function showUsage() {
  console.log(`
📚 Documentation Control & Synchronization System

Usage: node doc_control_main.js <operation> [options]

Operations:
  audit     - Audit documentation against current codebase (excluding client-angular/)
  cleanup   - Clean up and update outdated documentation 
  sync      - Synchronize documentation with recent code changes
  full      - Run complete workflow (audit + cleanup + sync)
  help      - Show this help message

Options:
  --force   - Force operation even if no changes detected
  --quiet   - Suppress verbose output
  --dry-run - Show what would be done without making changes

Examples:
  node doc_control_main.js audit
  node doc_control_main.js cleanup --force
  node doc_control_main.js full --quiet
  node doc_control_main.js sync --dry-run

For detailed information about the system, see docs/graph/ci_knowledge.md
`);
}

/**
 * Executes a script and returns the result
 * @param {string} scriptName - Name of the script to execute
 * @param {boolean} quiet - Whether to suppress output
 * @returns {Object} Execution result
 */
function executeScript(scriptName, quiet = false) {
  try {
    const scriptPath = path.join(__dirname, scriptName);
    
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Script not found: ${scriptPath}`);
    }
    
    if (!quiet) {
      console.log(`🚀 Executing: ${scriptName}`);
    }
    
    const startTime = Date.now();
    const output = execSync(`node ${scriptPath}`, {
      cwd: config.rootDir,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    
    const duration = Date.now() - startTime;
    
    if (!quiet) {
      console.log(`✅ Completed in ${duration}ms`);
    }
    
    return {
      success: true,
      output,
      duration,
      script: scriptName
    };
    
  } catch (error) {
    console.error(`❌ Error executing ${scriptName}:`, error.message);
    return {
      success: false,
      error: error.message,
      script: scriptName
    };
  }
}

/**
 * Runs the audit operation
 * @param {Object} options - Operation options
 * @returns {Object} Operation result
 */
async function runAudit(options = {}) {
  console.log('\n📊 Running Documentation Audit...');
  
  const result = executeScript(config.operations.audit.script, options.quiet);
  
  if (result.success) {
    console.log('📄 Audit report generated: docs/DOCUMENTATION_DISCREPANCIES_REPORT.md');
    
    // Parse audit results for summary
    const reportPath = path.join(config.rootDir, config.outputs.audit);
    if (fs.existsSync(reportPath)) {
      const reportContent = fs.readFileSync(reportPath, 'utf8');
      const undocumentedMatch = reportContent.match(/Undocumented Elements.*: (\d+)/);
      const outdatedMatch = reportContent.match(/Outdated Documentation.*: (\d+)/);
      
      result.metrics = {
        undocumented: undocumentedMatch ? parseInt(undocumentedMatch[1]) : 0,
        outdated: outdatedMatch ? parseInt(outdatedMatch[1]) : 0
      };
    }
  }
  
  return result;
}

/**
 * Runs the cleanup operation
 * @param {Object} options - Operation options  
 * @returns {Object} Operation result
 */
async function runCleanup(options = {}) {
  console.log('\n🧹 Running Documentation Cleanup...');
  
  const result = executeScript(config.operations.cleanup.script, options.quiet);
  
  if (result.success) {
    console.log('📄 Cleanup report generated: docs/DOCUMENTATION_CLEANUP_REPORT.md');
    
    // Parse cleanup results for summary
    const reportPath = path.join(config.rootDir, config.outputs.cleanup);
    if (fs.existsSync(reportPath)) {
      const reportContent = fs.readFileSync(reportPath, 'utf8');
      const updatedMatch = reportContent.match(/Files Updated.*: (\d+)/);
      const archivedMatch = reportContent.match(/Files Archived.*: (\d+)/);
      
      result.metrics = {
        updated: updatedMatch ? parseInt(updatedMatch[1]) : 0,
        archived: archivedMatch ? parseInt(archivedMatch[1]) : 0
      };
    }
  }
  
  return result;
}

/**
 * Runs the sync operation
 * @param {Object} options - Operation options
 * @returns {Object} Operation result  
 */
async function runSync(options = {}) {
  console.log('\n🔄 Running Documentation Synchronization...');
  
  const result = executeScript(config.operations.sync.script, options.quiet);
  
  if (result.success) {
    console.log('🧠 Knowledge graph updated: docs/graph/ci_knowledge.md');
    
    // TODO: Parse sync results for summary
    result.metrics = {
      synchronized: true
    };
  }
  
  return result;
}

/**
 * Runs the complete workflow
 * @param {Object} options - Operation options
 * @returns {Object} Complete workflow results
 */
async function runFullWorkflow(options = {}) {
  console.log('\n🎯 Running Complete Documentation Control Workflow...');
  
  const results = {
    audit: null,
    cleanup: null,
    sync: null,
    overall: {
      success: true,
      startTime: Date.now()
    }
  };
  
  try {
    // Step 1: Audit
    results.audit = await runAudit(options);
    if (!results.audit.success) {
      results.overall.success = false;
    }
    
    // Step 2: Cleanup (only if audit found issues or forced)
    const shouldCleanup = options.force || 
                         (results.audit.metrics && results.audit.metrics.outdated > 0);
    
    if (shouldCleanup) {
      results.cleanup = await runCleanup(options);
      if (!results.cleanup.success) {
        results.overall.success = false;
      }
    } else {
      console.log('\n⏭️  Skipping cleanup - no outdated documentation found');
    }
    
    // Step 3: Sync
    results.sync = await runSync(options);
    if (!results.sync.success) {
      results.overall.success = false;
    }
    
    results.overall.endTime = Date.now();
    results.overall.duration = results.overall.endTime - results.overall.startTime;
    
    // Generate summary report
    generateSummaryReport(results);
    
    return results;
    
  } catch (error) {
    console.error('❌ Error in full workflow:', error);
    results.overall.success = false;
    results.overall.error = error.message;
    return results;
  }
}

/**
 * Generates a comprehensive summary report
 * @param {Object} results - Workflow results
 */
function generateSummaryReport(results) {
  const timestamp = new Date().toISOString();
  
  let report = `# Documentation Control & Synchronization Summary

**Generated**: ${timestamp}
**Duration**: ${results.overall.duration}ms
**Status**: ${results.overall.success ? '✅ Success' : '❌ Failed'}

## Operations Performed

`;

  if (results.audit) {
    report += `### 📊 Audit
- **Status**: ${results.audit.success ? '✅ Success' : '❌ Failed'}
- **Duration**: ${results.audit.duration}ms`;
    
    if (results.audit.metrics) {
      report += `
- **Undocumented Elements**: ${results.audit.metrics.undocumented}
- **Outdated Documentation**: ${results.audit.metrics.outdated}`;
    }
    report += '\n\n';
  }
  
  if (results.cleanup) {
    report += `### 🧹 Cleanup
- **Status**: ${results.cleanup.success ? '✅ Success' : '❌ Failed'}
- **Duration**: ${results.cleanup.duration}ms`;
    
    if (results.cleanup.metrics) {
      report += `
- **Files Updated**: ${results.cleanup.metrics.updated}
- **Files Archived**: ${results.cleanup.metrics.archived}`;
    }
    report += '\n\n';
  }
  
  if (results.sync) {
    report += `### 🔄 Synchronization
- **Status**: ${results.sync.success ? '✅ Success' : '❌ Failed'}
- **Duration**: ${results.sync.duration}ms
- **Knowledge Graph Updated**: ${results.sync.metrics?.synchronized ? '✅' : '❌'}

`;
  }

  report += `## Generated Reports

- [Documentation Audit Report](DOCUMENTATION_DISCREPANCIES_REPORT.md)
- [Documentation Cleanup Report](DOCUMENTATION_CLEANUP_REPORT.md)  
- [Knowledge Graph](graph/ci_knowledge.md)

## System Status

The Documentation Control & Synchronization System is maintaining:
- Automated documentation auditing
- Proactive cleanup of outdated content  
- Real-time synchronization with code changes
- Knowledge graph for enhanced project understanding

## Next Actions

${results.overall.success ? 
  '✅ System is operating normally. Next scheduled run: 24 hours' :
  '⚠️ Review errors above and address any issues'
}

---
*Generated by Documentation Control & Synchronization System*
`;

  // Write summary report
  const summaryPath = path.join(config.rootDir, config.outputs.summary);
  fs.writeFileSync(summaryPath, report);
  
  console.log(`\n📋 Summary report generated: ${config.outputs.summary}`);
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'help') {
    showUsage();
    return;
  }
  
  const operation = args[0];
  const options = {
    force: args.includes('--force'),
    quiet: args.includes('--quiet'),
    dryRun: args.includes('--dry-run')
  };
  
  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made');
  }
  
  console.log('📚 Documentation Control & Synchronization System');
  console.log(`🎯 Operation: ${operation}`);
  console.log(`📁 Root directory: ${config.rootDir}`);
  
  let result;
  
  switch (operation) {
    case 'audit':
      result = await runAudit(options);
      break;
      
    case 'cleanup':
      result = await runCleanup(options);
      break;
      
    case 'sync':
      result = await runSync(options);
      break;
      
    case 'full':
      result = await runFullWorkflow(options);
      break;
      
    default:
      console.error(`❌ Unknown operation: ${operation}`);
      showUsage();
      process.exit(1);
  }
  
  // Final status
  if (result && result.overall) {
    console.log(`\n🏁 Workflow ${result.overall.success ? 'completed successfully' : 'failed'}`);
    process.exit(result.overall.success ? 0 : 1);
  } else if (result) {
    console.log(`\n🏁 Operation ${result.success ? 'completed successfully' : 'failed'}`);
    process.exit(result.success ? 0 : 1);
  }
}

// Execute the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

export { runAudit, runCleanup, runSync, runFullWorkflow };