import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { ERROR_PATTERNS } from './analyze-workflow-errors.js';

/**
 * Validates error patterns against the most recent workflow logs
 * to ensure we're not missing any common error patterns
 */
function validateErrorPatterns() {
  const logsDir = 'workflow-error-logs-temp';
  const unmatched = new Set();
  let totalLines = 0;
  let matchedLines = 0;

  try {
    // Read all log directories
    const workflowDirs = readdirSync(logsDir).filter(d => !d.startsWith('.'));
    
    for (const workflowDir of workflowDirs) {
      const workflowPath = join(logsDir, workflowDir);
      const runDirs = readdirSync(workflowPath).filter(d => !d.startsWith('.') && !d.endsWith('.json'));
      
      for (const runDir of runDirs) {
        const runPath = join(workflowPath, runDir);
        const logFiles = readdirSync(runPath)
          .filter(f => f.endsWith('.txt') || f.endsWith('.log'));
        
        for (const logFile of logFiles) {
          const logContent = readFileSync(join(runPath, logFile), 'utf8');
          
          // Split into lines and process each error line
          const lines = logContent.split('\n');
          for (const line of lines) {
            if (line.toLowerCase().includes('error') || line.toLowerCase().includes('fail')) {
              totalLines++;
              let matched = false;
              
              // Check if line matches any known pattern
              for (const pattern of ERROR_PATTERNS) {
                if (pattern.pattern.test(line)) {
                  matched = true;
                  matchedLines++;
                  break;
                }
              }
              
              if (!matched) {
                unmatched.add(line.trim());
              }
            }
          }
        }
      }
    }
    
    // Generate report
    console.log('\n=== Error Pattern Coverage Report ===');
    console.log(`Total error lines analyzed: ${totalLines}`);
    console.log(`Lines matched by patterns: ${matchedLines}`);
    console.log(`Pattern coverage: ${((matchedLines / totalLines) * 100).toFixed(1)}%`);
    
    if (unmatched.size > 0) {
      console.log('\nUnmatched error patterns:');
      const sortedUnmatched = Array.from(unmatched)
        .sort((a, b) => {
          // Sort by frequency of similar errors
          const aFreq = Array.from(unmatched).filter(l => l.includes(a.substring(0, 20))).length;
          const bFreq = Array.from(unmatched).filter(l => l.includes(b.substring(0, 20))).length;
          return bFreq - aFreq;
        })
        .slice(0, 10); // Show top 10 most frequent

      sortedUnmatched.forEach(line => {
        console.log(`- ${line}`);
      });
      
      console.log('\nRecommended new patterns:');
      generatePatternSuggestions(sortedUnmatched);
    }
    
    // Exit with error if coverage is too low
    if (matchedLines / totalLines < 0.7) {
      console.error('\n⚠️ Warning: Error pattern coverage is below 70%');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Failed to validate error patterns:', error);
    process.exit(1);
  }
}

/**
 * Generates suggestions for new error patterns based on unmatched lines
 */
function generatePatternSuggestions(unmatchedLines) {
  unmatchedLines.forEach(line => {
    // Extract key parts of the error message
    const errorParts = line.match(/(?:error|fail|exception)[:]\s*([^:]+)/i);
    if (errorParts) {
      const errorMessage = errorParts[1].trim();
      const suggestion = {
        pattern: errorMessage
          .replace(/[0-9]+/g, '\\d+')
          .replace(/['"]/g, '[\'"]')
          .replace(/\s+/g, '\\s+')
          .replace(/\[/g, '\\[')
          .replace(/\]/g, '\\]')
          .replace(/\(/g, '\\(')
          .replace(/\)/g, '\\)'),
        name: errorMessage
          .split(/[^a-zA-Z]+/)
          .filter(Boolean)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' '),
      };
      
      console.log(`{
  pattern: /${suggestion.pattern}/i,
  name: '${suggestion.name} Error',
  description: 'TODO: Add description',
  recommendation: 'TODO: Add recommendation'
},`);
    }
  });
}

// Run validator
validateErrorPatterns();
