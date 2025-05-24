import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * ERROR_PATTERNS: List of known error patterns to detect in workflow logs.
 * Each pattern includes:
 *  - pattern: A RegExp to search for in log files
 *  - name: Short name for the error
 *  - description: Explanation of the error
 *  - recommendation: Suggested fix or action
 */
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

/**
 * Analyze log files in a specified directory for known error patterns.
 * @param {string} logDir - Directory containing workflow log files.
 * @returns {Object} Analysis results by workflow, run, and job.
 */
function analyzeLogFiles(logDir) {
  // Output object to collect all results
  const results = {};

  // Validate that the directory exists
  if (!existsSync(logDir)) {
    console.error(`❌ Log directory does not exist: ${logDir}`);
    process.exit(1);
  }

  try {
    // Get workflow directories (skip hidden)
    const workflowDirs = readdirSync(logDir).filter(d => !d.startsWith('.'));

    for (const workflowDir of workflowDirs) {
      const workflowPath = join(logDir, workflowDir);

      // Get run directories for each workflow (skip hidden)
      const runDirs = readdirSync(workflowPath).filter(d => !d.startsWith('.'));
      results[workflowDir] = {};

      for (const runDir of runDirs) {
        const runPath = join(workflowPath, runDir);

        // Read run metadata (handle parse errors)
        let metadata;
        try {
          metadata = JSON.parse(readFileSync(join(runPath, 'run-metadata.json'), 'utf8'));
        } catch (err) {
          console.error(`❌ Error reading/parsing run metadata for ${runPath}: ${err.message}`);
          continue;
        }

        results[workflowDir][runDir] = {
          metadata,
          errors: []
        };

        // Analyze each job's logs in the run directory
        const jobDirs = readdirSync(runPath).filter(d => !d.startsWith('.') && d !== 'run-metadata.json');

        for (const jobDir of jobDirs) {
          const jobPath = join(runPath, jobDir);

          // Only analyze .txt files (log files)
          let logFiles;
          try {
            logFiles = readdirSync(jobPath).filter(f => f.endsWith('.txt'));
          } catch (err) {
            console.error(`❌ Error reading job directory ${jobPath}: ${err.message}`);
            continue;
          }

          for (const logFile of logFiles) {
            let logContent;
            try {
              logContent = readFileSync(join(jobPath, logFile), 'utf8');
            } catch (err) {
              console.error(`❌ Error reading log file ${logFile}: ${err.message}`);
              continue;
            }

            // Match against all known ERROR_PATTERNS
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
 * Generates an HTML report from analysis results.
 * @param {Object} results - The output from analyzeLogFiles.
 * @returns {string} - HTML report as string.
 */
function generateHTMLReport(results) {
  // Begin HTML document
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Workflow Error Analysis Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2rem; background: #fcfcfc; color: #222; }
    h1 { color: #0057b7; }
    h2 { color: #2a2a2a; margin-top: 2rem; border-bottom: 1px solid #ddd; }
    .workflow-section { margin-bottom: 2rem; }
    .job-section { margin-bottom: 1.5rem; }
    .error-type { background: #ffe8e8; border-left: 4px solid #c00; padding: 0.75rem; margin: 1rem 0; }
    .meta { color: #555; font-size: 0.97em; }
    ul { margin: 0 0 1rem 1.5rem; }
    .toc { background: #f5f5f5; padding: 1rem; border-radius: 5px; }
    .occurrences { color: #555; font-size: 0.95em; }
    .logfile { font-size: 0.95em; color: #888; }
    a { color: #0057b7; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Workflow Error Analysis Report</h1>
  <div class="meta">Generated on: ${new Date().toISOString()}</div>
`;

  // Table of Contents
  html += `<div class="toc"><h2>Table of Contents</h2><ul>`;
  for (const workflow of Object.keys(results)) {
    html += `<li><a href="#${workflow.replace(/\s+/g, '-')}">${workflow}</a></li>`;
  }
  html += `</ul></div>`;

  // Workflow sections
  for (const [workflow, runs] of Object.entries(results)) {
    html += `<div class="workflow-section"><h2 id="${workflow.replace(/\s+/g, '-')}">${workflow}</h2>`;

    for (const [runId, data] of Object.entries(runs)) {
      if (data.errors.length > 0) {
        html += `<div class="job-section"><h3>Job: ${data.metadata.name} <span class="meta">(Run ID: ${runId})</span></h3>`;

        // Group errors by type for better readability
        const errorsByType = data.errors.reduce((acc, error) => {
          if (!acc[error.name]) acc[error.name] = [];
          acc[error.name].push(error);
          return acc;
        }, {});

        for (const [errorType, errors] of Object.entries(errorsByType)) {
          html += `<div class="error-type">
            <strong>${errorType}</strong><br>
            <span>${errors[0].description}</span><br>
            <strong>Recommendation:</strong> ${errors[0].recommendation}<br>
            <span class="occurrences">Occurrences: ${errors.length} (Jobs: ${errors.map(e => e.jobName).join(', ')})</span><br>
            <span class="logfile">Log files: ${errors.map(e => e.logFile).join(', ')}</span>
          </div>`;
        }

        html += `</div>`;
      }
    }

    html += `</div>`;
  }

  html += `
</body>
</html>
`;

  return html;
}

// === Entry Point ===
// This block runs if the script is called directly from the command line using Node.js
if (import.meta.url === `file://${process.argv[1]}`) {
  // Constants for input/output paths
  const LOG_DIR = 'workflow-error-logs-temp';
  const REPORT_FILE = 'workflow-error-report.html';

  console.log('Analyzing workflow logs...');

  // Analyze logs and generate report
  const results = analyzeLogFiles(LOG_DIR);
  const htmlReport = generateHTMLReport(results);

  writeFileSync(REPORT_FILE, htmlReport);
  console.log(`✅ Analysis complete. HTML report generated at ${REPORT_FILE}`);
}
