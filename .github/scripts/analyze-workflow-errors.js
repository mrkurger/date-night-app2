import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

// Error patterns to detect in workflow logs
export const ERROR_PATTERNS = [
  // CI Environment Issues
  {
    pattern: /sh: 1: husky: not found/i,
    name: 'Husky Not Found',
    description: 'Husky git hooks are failing in CI environment',
    recommendation: 'Run disable-husky-in-ci.js in the prepare step or use skipCI in .huskyrc'
  },
  {
    pattern: /ENOSPC: no space left on device/i,
    name: 'Disk Space Error',
    description: 'CI runner has run out of disk space',
    recommendation: 'Clean up artifacts or increase disk space allocation in CI'
  },

  // Angular/Nebular Issues
  {
    pattern: /ERR! Cannot read properties of undefined \(reading 'root'\)/i,
    name: 'Angular Router Error',
    description: 'Router configuration error in Angular tests',
    recommendation: 'Check TestBed configuration and route declarations in test files'
  },
  {
    pattern: /No provider for Nb\w+Service/i,
    name: 'Missing Nebular Provider',
    description: 'Nebular service provider not found in test setup',
    recommendation: 'Add required Nebular service to TestBed providers array and import NbThemeModule'
  },
  {
    pattern: /NbThemeModule.*has been already loaded/i,
    name: 'Duplicate Theme Module',
    description: 'NbThemeModule loaded multiple times',
    recommendation: 'Import NbThemeModule.forRoot() only in AppModule, use NbThemeModule in feature modules'
  },

  // Style Issues
  {
    pattern: /@import.*is deprecated/i,
    name: 'SCSS Deprecation Warning',
    description: 'Using deprecated @import in SCSS files',
    recommendation: 'Replace @import with @use/@forward in SCSS files'
  },
  {
    pattern: /darken\(\).*function is deprecated/i,
    name: 'SCSS Function Deprecation',
    description: 'Using deprecated SCSS color functions',
    recommendation: 'Use color.scale() or color.adjust() instead'
  },
  {
    pattern: /\/\s+in\s+SCSS\s+will\s+be\s+removed/i,
    name: 'SCSS Division Deprecation',
    description: 'Using deprecated / for division in SCSS',
    recommendation: 'Use math.div() function instead'
  },

  // Testing Issues
  {
    pattern: /HttpTestingController.*found (none|multiple)/i,
    name: 'HTTP Test Error',
    description: 'HttpTestingController expectations not met',
    recommendation: 'Check HTTP mock setup in tests and ensure expectations match actual requests'
  },
  {
    pattern: /zone(-microtask)?\.js.*has been loaded/i,
    name: 'Zone.js Loading Error',
    description: 'Zone.js loaded multiple times or in wrong order',
    recommendation: 'Ensure Zone.js is imported only once in polyfills.ts before other imports'
  },
  {
    pattern: /component.*is not a known element/i,
    name: 'Unknown Component Error',
    description: 'Component not declared in module or standalone imports',
    recommendation: 'Add component to module declarations or standalone imports array'
  },

  // Dependency Issues
  {
    pattern: /Cannot find module 'angularx-qrcode'/i,
    name: 'Missing QR Code Module',
    description: 'Angular QR Code module not found',
    recommendation: 'Run npm install angularx-qrcode in client-angular directory'
  },
  {
    pattern: /@nebular\/theme.*peer dep.*@angular\/core/i,
    name: 'Nebular Peer Dependency',
    description: 'Nebular and Angular version mismatch',
    recommendation: 'Ensure @nebular/theme version matches your Angular version'
  },
  {
    pattern: /package.json.*has incorrect peer dependency/i,
    name: 'Incorrect Peer Dependencies',
    description: 'Package peer dependency version mismatch',
    recommendation: 'Update package versions to match peer dependency requirements'
  },

  // TypeScript/Compilation Issues
  {
    pattern: /Type.*is not assignable to type/i,
    name: 'TypeScript Type Error',
    description: 'Type mismatch in TypeScript code',
    recommendation: 'Check type definitions and ensure proper type usage'
  },
  {
    pattern: /Cannot find name 'NbThemeService'/i,
    name: 'Missing Nebular Import',
    description: 'Nebular service or type not imported',
    recommendation: 'Import required Nebular services/types from @nebular/theme'
  },
  {
    pattern: /standalone.*cannot be resolved/i,
    name: 'Standalone Component Error',
    description: 'Issues with standalone component configuration',
    recommendation: 'Check standalone component imports and ensure Angular version supports standalone components'
  },

  // MongoDB Issues
  {
    pattern: /MongoServerError.*failed to connect/i,
    name: 'MongoDB Connection Error',
    description: 'Failed to connect to MongoDB server',
    recommendation: 'Check if MongoDB is running and connection string is correct'
  },
  {
    pattern: /MongoServerError.*duplicate key error/i,
    name: 'MongoDB Duplicate Key',
    description: 'Attempted to insert duplicate unique key',
    recommendation: 'Ensure unique indexes are properly configured and handle duplicate key errors'
  }
];

const ERROR_PATTERNS = [
  // CI Environment Issues
  {
    pattern: /sh: 1: husky: not found/i,
    name: 'Husky Not Found',
    description: 'Husky git hooks are failing in CI environment',
    recommendation: 'Run disable-husky-in-ci.js in the prepare step or use skipCI in .huskyrc'
  },
  {
    pattern: /ENOSPC: no space left on device/i,
    name: 'Disk Space Error',
    description: 'CI runner has run out of disk space',
    recommendation: 'Clean up artifacts or increase disk space allocation in CI'
  },

  // Angular/Nebular Issues
  {
    pattern: /ERR! Cannot read properties of undefined \(reading 'root'\)/i,
    name: 'Angular Router Error',
    description: 'Router configuration error in Angular tests',
    recommendation: 'Check TestBed configuration and route declarations in test files'
  },
  {
    pattern: /No provider for Nb\w+Service/i,
    name: 'Missing Nebular Provider',
    description: 'Nebular service provider not found in test setup',
    recommendation: 'Add required Nebular service to TestBed providers array and import NbThemeModule'
  },
  {
    pattern: /NbThemeModule.*has been already loaded/i,
    name: 'Duplicate Theme Module',
    description: 'NbThemeModule loaded multiple times',
    recommendation: 'Import NbThemeModule.forRoot() only in AppModule, use NbThemeModule in feature modules'
  },

  // Style Issues
  {
    pattern: /@import.*is deprecated/i,
    name: 'SCSS Deprecation Warning',
    description: 'Using deprecated @import in SCSS files',
    recommendation: 'Replace @import with @use/@forward in SCSS files'
  },
  {
    pattern: /darken\(\).*function is deprecated/i,
    name: 'SCSS Function Deprecation',
    description: 'Using deprecated SCSS color functions',
    recommendation: 'Use color.scale() or color.adjust() instead'
  },
  {
    pattern: /\/\s+in\s+SCSS\s+will\s+be\s+removed/i,
    name: 'SCSS Division Deprecation',
    description: 'Using deprecated / for division in SCSS',
    recommendation: 'Use math.div() function instead'
  },

  // Testing Issues
  {
    pattern: /HttpTestingController.*found (none|multiple)/i,
    name: 'HTTP Test Error',
    description: 'HttpTestingController expectations not met',
    recommendation: 'Check HTTP mock setup in tests and ensure expectations match actual requests'
  },
  {
    pattern: /zone(-microtask)?\.js.*has been loaded/i,
    name: 'Zone.js Loading Error',
    description: 'Zone.js loaded multiple times or in wrong order',
    recommendation: 'Ensure Zone.js is imported only once in polyfills.ts before other imports'
  },
  {
    pattern: /component.*is not a known element/i,
    name: 'Unknown Component Error',
    description: 'Component not declared in module or standalone imports',
    recommendation: 'Add component to module declarations or standalone imports array'
  },

  // Dependency Issues
  {
    pattern: /Cannot find module 'angularx-qrcode'/i,
    name: 'Missing QR Code Module',
    description: 'Angular QR Code module not found',
    recommendation: 'Run npm install angularx-qrcode in client-angular directory'
  },
  {
    pattern: /@nebular\/theme.*peer dep.*@angular\/core/i,
    name: 'Nebular Peer Dependency',
    description: 'Nebular and Angular version mismatch',
    recommendation: 'Ensure @nebular/theme version matches your Angular version'
  },
  {
    pattern: /package.json.*has incorrect peer dependency/i,
    name: 'Incorrect Peer Dependencies',
    description: 'Package peer dependency version mismatch',
    recommendation: 'Update package versions to match peer dependency requirements'
  },

  // TypeScript/Compilation Issues
  {
    pattern: /Type.*is not assignable to type/i,
    name: 'TypeScript Type Error',
    description: 'Type mismatch in TypeScript code',
    recommendation: 'Check type definitions and ensure proper type usage'
  },
  {
    pattern: /Cannot find name 'NbThemeService'/i,
    name: 'Missing Nebular Import',
    description: 'Nebular service or type not imported',
    recommendation: 'Import required Nebular services/types from @nebular/theme'
  },
  {
    pattern: /standalone.*cannot be resolved/i,
    name: 'Standalone Component Error',
    description: 'Issues with standalone component configuration',
    recommendation: 'Check standalone component imports and ensure Angular version supports standalone components'
  },

  // MongoDB Issues
  {
    pattern: /MongoServerError.*failed to connect/i,
    name: 'MongoDB Connection Error',
    description: 'Failed to connect to MongoDB server',
    recommendation: 'Check if MongoDB is running and connection string is correct'
  },
  {
    pattern: /MongoServerError.*duplicate key error/i,
    name: 'MongoDB Duplicate Key',
    description: 'Attempted to insert duplicate unique key',
    recommendation: 'Ensure unique indexes are properly configured and handle duplicate key errors'
  }
];
];

/**
 * Analyzes log files for known error patterns
 * @param {string} logDir - Directory containing log files
 * @returns {Object} Analysis results
 */
function analyzeLogFiles(logDir) {
  const results = {};
  
  try {
    const workflowDirs = readdirSync(logDir).filter(d => !d.startsWith('.'));
    
    for (const workflowDir of workflowDirs) {
      const workflowPath = join(logDir, workflowDir);
      const runDirs = readdirSync(workflowPath).filter(d => !d.startsWith('.'));
      
      results[workflowDir] = {};
      
      for (const runDir of runDirs) {
        const runPath = join(workflowPath, runDir);
        const metadata = JSON.parse(readFileSync(join(runPath, 'run-metadata.json'), 'utf8'));
        
        results[workflowDir][runDir] = {
          metadata,
          errors: []
        };
        
        // Analyze each job's logs
        const jobDirs = readdirSync(runPath).filter(d => !d.startsWith('.') && d !== 'run-metadata.json');
        
        for (const jobDir of jobDirs) {
          const jobPath = join(runPath, jobDir);
          const logFiles = readdirSync(jobPath).filter(f => f.endsWith('.txt'));
          
          for (const logFile of logFiles) {
            const logContent = readFileSync(join(jobPath, logFile), 'utf8');
            
            // Check for known error patterns
            for (const pattern of ERROR_PATTERNS) {
              if (pattern.pattern.test(logContent)) {
                results[workflowDir][runDir].errors.push({
                  ...pattern,
                  jobName: jobDir,
                  logFile
                });
              }
            }
          }
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('❌ Error analyzing logs:', error.message);
    process.exit(1);
  }
}

/**
 * Generates markdown report from analysis results
 * @param {Object} results - Analysis results
 * @returns {string} Markdown report
 */
function generateReport(results) {
  let report = '# Workflow Error Analysis Report\n\n';
  report += `Generated on: ${new Date().toISOString()}\n\n`;
  
  // Generate TOC
  report += '## Table of Contents\n\n';
  for (const workflow of Object.keys(results)) {
    report += `- [${workflow}](#${workflow})\n`;
  }
  report += '\n';
  
  // Generate workflow sections
  for (const [workflow, runs] of Object.entries(results)) {
    report += `## ${workflow}\n\n`;
    
    for (const [runId, data] of Object.entries(runs)) {
      if (data.errors.length > 0) {
        report += `### Job: ${data.metadata.name} (Run ID: ${runId})\n\n`;
        
        // Group errors by type
        const errorsByType = data.errors.reduce((acc, error) => {
          if (!acc[error.name]) acc[error.name] = [];
          acc[error.name].push(error);
          return acc;
        }, {});
        
        for (const [errorType, errors] of Object.entries(errorsByType)) {
          report += `#### ${errorType}\n`;
          report += `- Description: ${errors[0].description}\n`;
          report += `- Recommendation: ${errors[0].recommendation}\n`;
          report += `- Occurrences: ${errors.length} (Jobs: ${errors.map(e => e.jobName).join(', ')})\n\n`;
        }
      }
    }
  }
  
  return report;
}

// Run if called directly
if (require.main === module) {
  const logDir = 'workflow-error-logs-temp';
  console.log('Analyzing workflow logs...');
  
  const results = analyzeLogFiles(logDir);
  const report = generateReport(results);
  
  writeFileSync('workflow-error-report.md', report);
  console.log('✅ Analysis complete. Report generated at workflow-error-report.md');
}
