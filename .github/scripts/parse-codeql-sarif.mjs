#!/usr/bin/env node

// File: .github/scripts/parse-codeql-sarif.mjs

/**
 * Parse CodeQL SARIF files for GitHub Pro+ users
 * Since we can't upload to Security tab, this script converts SARIF to readable formats
 * 
 * Usage: node parse-codeql-sarif.mjs <sarif-file> [output-format]
 * Output formats: markdown (default), json, html
 */

// Import required modules using ESModules syntax
import { readFile, writeFile } from 'fs/promises';
import { basename, extname } from 'path';
import { argv, exit } from 'process';

/**
 * Severity mapping for SARIF levels
 */
const SEVERITY_MAP = {
  'error': { label: 'HIGH', emoji: '🔴', priority: 1 },
  'warning': { label: 'MEDIUM', emoji: '🟡', priority: 2 },
  'note': { label: 'LOW', emoji: '🔵', priority: 3 },
  'none': { label: 'INFO', emoji: 'ℹ️', priority: 4 }
};

/**
 * Parse command line arguments
 * @returns {Object} Parsed arguments
 */
function parseArgs() {
  const args = argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: node parse-codeql-sarif.mjs <sarif-file> [output-format]');
    console.error('Output formats: markdown (default), json, html');
    exit(1);
  }
  
  return {
    inputFile: args[0],
    outputFormat: args[1] || 'markdown'
  };
}

/**
 * Parse SARIF file and extract security findings
 * @param {string} sarifPath - Path to SARIF file
 * @returns {Promise<Object>} Parsed findings
 */
async function parseSARIF(sarifPath) {
  try {
    // Read SARIF file
    const content = await readFile(sarifPath, 'utf8');
    const sarif = JSON.parse(content);
    
    // Extract findings
    const findings = [];
    const stats = {
      total: 0,
      bySeverity: {},
      byRule: {},
      byFile: {}
    };
    
    // Initialize severity counters
    Object.values(SEVERITY_MAP).forEach(({ label }) => {
      stats.bySeverity[label] = 0;
    });
    
    // Process each run in the SARIF file
    for (const run of sarif.runs || []) {
      const tool = run.tool?.driver?.name || 'Unknown Tool';
      const rules = run.tool?.driver?.rules || [];
      
      // Create rule lookup map
      const ruleMap = new Map();
      rules.forEach(rule => {
        ruleMap.set(rule.id, rule);
      });
      
      // Process results
      for (const result of run.results || []) {
        const ruleId = result.ruleId || 'unknown';
        const rule = ruleMap.get(ruleId) || {};
        const level = result.level || 'warning';
        const severity = SEVERITY_MAP[level] || SEVERITY_MAP.warning;
        
        // Extract location information
        const locations = [];
        for (const location of result.locations || []) {
          const physicalLocation = location.physicalLocation;
          if (physicalLocation) {
            const artifact = physicalLocation.artifactLocation;
            const region = physicalLocation.region;
            
            locations.push({
              file: artifact?.uri || 'unknown',
              startLine: region?.startLine || 0,
              startColumn: region?.startColumn || 0,
              endLine: region?.endLine || region?.startLine || 0,
              endColumn: region?.endColumn || region?.startColumn || 0,
              snippet: region?.snippet?.text || ''
            });
          }
        }
        
        // Create finding object
        const finding = {
          tool,
          ruleId,
          ruleName: rule.name || ruleId,
          ruleDescription: rule.shortDescription?.text || rule.fullDescription?.text || '',
          message: result.message?.text || 'No message provided',
          severity: severity.label,
          severityEmoji: severity.emoji,
          severityPriority: severity.priority,
          locations,
          fingerprint: result.fingerprints?.primary || generateFingerprint(result),
          properties: result.properties || {},
          fixes: result.fixes || []
        };
        
        findings.push(finding);
        
        // Update statistics
        stats.total++;
        stats.bySeverity[severity.label]++;
        stats.byRule[ruleId] = (stats.byRule[ruleId] || 0) + 1;
        
        // Count by file
        locations.forEach(loc => {
          stats.byFile[loc.file] = (stats.byFile[loc.file] || 0) + 1;
        });
      }
    }
    
    // Sort findings by severity priority and then by file
    findings.sort((a, b) => {
      if (a.severityPriority !== b.severityPriority) {
        return a.severityPriority - b.severityPriority;
      }
      return (a.locations[0]?.file || '').localeCompare(b.locations[0]?.file || '');
    });
    
    return {
      metadata: {
        version: sarif.version,
        tool: sarif.runs[0]?.tool?.driver?.name || 'Unknown',
        timestamp: new Date().toISOString(),
        sourceFile: basename(sarifPath)
      },
      stats,
      findings
    };
    
  } catch (error) {
    console.error(`Error parsing SARIF file: ${error.message}`);
    throw error;
  }
}

/**
 * Generate a fingerprint for deduplication
 * @param {Object} result - SARIF result object
 * @returns {string} Fingerprint
 */
function generateFingerprint(result) {
  const parts = [
    result.ruleId,
    result.locations?.[0]?.physicalLocation?.artifactLocation?.uri,
    result.locations?.[0]?.physicalLocation?.region?.startLine,
    result.message?.text?.substring(0, 50)
  ].filter(Boolean);
  
  // Simple hash
  return parts.join('|').split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0).toString(36);
}

/**
 * Format findings as Markdown
 * @param {Object} data - Parsed findings data
 * @returns {string} Markdown formatted report
 */
function formatAsMarkdown(data) {
  let markdown = `# CodeQL Security Analysis Report\n\n`;
  markdown += `**Generated:** ${data.metadata.timestamp}\n`;
  markdown += `**Tool:** ${data.metadata.tool}\n`;
  markdown += `**Source:** ${data.metadata.sourceFile}\n\n`;
  
  // Summary section
  markdown += `## 📊 Summary\n\n`;
  markdown += `**Total Issues:** ${data.stats.total}\n\n`;
  
  // Severity breakdown table
  markdown += `### Severity Breakdown\n\n`;
  markdown += `| Severity | Count | Percentage |\n`;
  markdown += `|----------|-------|------------|\n`;
  
  Object.entries(data.stats.bySeverity).forEach(([severity, count]) => {
    const percentage = data.stats.total > 0 ? ((count / data.stats.total) * 100).toFixed(1) : '0';
    const emoji = Object.values(SEVERITY_MAP).find(s => s.label === severity)?.emoji || '';
    markdown += `| ${emoji} ${severity} | ${count} | ${percentage}% |\n`;
  });
  
  markdown += `\n`;
  
  // Top issues by rule
  markdown += `### Top Issues by Rule\n\n`;
  const topRules = Object.entries(data.stats.byRule)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  
  topRules.forEach(([rule, count]) => {
    markdown += `- **${rule}**: ${count} occurrence${count > 1 ? 's' : ''}\n`;
  });
  
  markdown += `\n`;
  
  // Most affected files
  markdown += `### Most Affected Files\n\n`;
  const topFiles = Object.entries(data.stats.byFile)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  
  topFiles.forEach(([file, count]) => {
    markdown += `- \`${file}\`: ${count} issue${count > 1 ? 's' : ''}\n`;
  });
  
  markdown += `\n`;
  
  // Detailed findings
  if (data.findings.length > 0) {
    markdown += `## 🔍 Detailed Findings\n\n`;
    
    // Group by severity
    const grouped = {};
    data.findings.forEach(finding => {
      if (!grouped[finding.severity]) {
        grouped[finding.severity] = [];
      }
      grouped[finding.severity].push(finding);
    });
    
    // Output by severity
    Object.entries(grouped).forEach(([severity, findings]) => {
      const severityInfo = Object.values(SEVERITY_MAP).find(s => s.label === severity);
      markdown += `### ${severityInfo?.emoji || ''} ${severity} Severity Issues\n\n`;
      
      findings.slice(0, 10).forEach((finding, index) => {
        markdown += `#### ${index + 1}. ${finding.ruleName} (${finding.ruleId})\n\n`;
        markdown += `**Message:** ${finding.message}\n\n`;
        
        if (finding.ruleDescription) {
          markdown += `**Description:** ${finding.ruleDescription}\n\n`;
        }
        
        // Location information
        if (finding.locations.length > 0) {
          const loc = finding.locations[0];
          markdown += `**Location:** \`${loc.file}:${loc.startLine}:${loc.startColumn}\`\n\n`;
          
          if (loc.snippet) {
            markdown += `**Code:**\n`;
            markdown += '```\n';
            markdown += loc.snippet;
            markdown += '\n```\n\n';
          }
        }
        
        // Suggested fixes
        if (finding.fixes && finding.fixes.length > 0) {
          markdown += `**Suggested Fix:**\n`;
          finding.fixes.forEach(fix => {
            if (fix.description) {
              markdown += `- ${fix.description.text}\n`;
            }
          });
          markdown += `\n`;
        }
        
        markdown += `---\n\n`;
      });
      
      if (findings.length > 10) {
        markdown += `*... and ${findings.length - 10} more ${severity} issues*\n\n`;
      }
    });
  } else {
    markdown += `## ✅ No Security Issues Found!\n\n`;
    markdown += `Great job! The CodeQL analysis didn't find any security vulnerabilities.\n`;
  }
  
  // Recommendations
  markdown += `## 💡 Recommendations\n\n`;
  
  if (data.stats.bySeverity.HIGH > 0) {
    markdown += `1. **Immediate Action Required:** Fix all HIGH severity issues before deployment\n`;
    markdown += `2. Review the CodeQL rules documentation for remediation guidance\n`;
  } else if (data.stats.bySeverity.MEDIUM > 0) {
    markdown += `1. Schedule remediation of MEDIUM severity issues\n`;
    markdown += `2. Consider adding CodeQL suppressions for false positives\n`;
  } else {
    markdown += `1. Continue following security best practices\n`;
    markdown += `2. Keep CodeQL rules updated for latest security patterns\n`;
  }
  
  markdown += `\n---\n`;
  markdown += `*Report generated by parse-codeql-sarif.mjs for GitHub Pro+ users*\n`;
  
  return markdown;
}

/**
 * Format findings as JSON
 * @param {Object} data - Parsed findings data
 * @returns {string} JSON formatted report
 */
function formatAsJSON(data) {
  return JSON.stringify(data, null, 2);
}

/**
 * Format findings as HTML
 * @param {Object} data - Parsed findings data
 * @returns {string} HTML formatted report
 */
function formatAsHTML(data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeQL Security Report - ${data.metadata.sourceFile}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: #24292e;
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .header h1 { margin: 0 0 10px 0; }
    .metadata { opacity: 0.8; font-size: 0.9em; }
    .card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .stat-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      text-align: center;
    }
    .stat-value {
      font-size: 2.5em;
      font-weight: bold;
      color: #0366d6;
    }
    .stat-label {
      color: #586069;
      font-size: 0.9em;
    }
    .severity-high { color: #dc3545; }
    .severity-medium { color: #ffc107; }
    .severity-low { color: #0366d6; }
    .finding {
      border-left: 4px solid #e1e4e8;
      padding-left: 15px;
      margin: 20px 0;
    }
    .finding.high { border-color: #dc3545; }
    .finding.medium { border-color: #ffc107; }
    .finding.low { border-color: #0366d6; }
    code {
      background: #f6f8fa;
      padding: 2px 5px;
      border-radius: 3px;
      font-family: 'Consolas', 'Monaco', monospace;
    }
    pre {
      background: #f6f8fa;
      padding: 10px;
      border-radius: 5px;
      overflow-x: auto;
    }
    .location {
      color: #0366d6;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔐 CodeQL Security Analysis Report</h1>
    <div class="metadata">
      <p>Generated: ${data.metadata.timestamp}</p>
      <p>Tool: ${data.metadata.tool} | Source: ${data.metadata.sourceFile}</p>
    </div>
  </div>
  
  <div class="card">
    <h2>📊 Summary</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${data.stats.total}</div>
        <div class="stat-label">Total Issues</div>
      </div>
      <div class="stat-card">
        <div class="stat-value severity-high">${data.stats.bySeverity.HIGH || 0}</div>
        <div class="stat-label">High Severity</div>
      </div>
      <div class="stat-card">
        <div class="stat-value severity-medium">${data.stats.bySeverity.MEDIUM || 0}</div>
        <div class="stat-label">Medium Severity</div>
      </div>
      <div class="stat-card">
        <div class="stat-value severity-low">${data.stats.bySeverity.LOW || 0}</div>
        <div class="stat-label">Low Severity</div>
      </div>
    </div>
  </div>
  
  <div class="card">
    <h2>🔍 Findings</h2>
    ${data.findings.length === 0 ? '<p>✅ No security issues found!</p>' : 
      data.findings.slice(0, 20).map((finding, index) => `
        <div class="finding ${finding.severity.toLowerCase()}">
          <h3>${index + 1}. ${finding.severityEmoji} ${finding.ruleName}</h3>
          <p><strong>Rule ID:</strong> <code>${finding.ruleId}</code></p>
          <p><strong>Message:</strong> ${finding.message}</p>
          ${finding.ruleDescription ? `<p><strong>Description:</strong> ${finding.ruleDescription}</p>` : ''}
          ${finding.locations[0] ? `
            <p><strong>Location:</strong> <span class="location">${finding.locations[0].file}:${finding.locations[0].startLine}:${finding.locations[0].startColumn}</span></p>
            ${finding.locations[0].snippet ? `<pre><code>${finding.locations[0].snippet}</code></pre>` : ''}
          ` : ''}
        </div>
      `).join('')
    }
    ${data.findings.length > 20 ? `<p><em>... and ${data.findings.length - 20} more findings</em></p>` : ''}
  </div>
</body>
</html>`;
}

/**
 * Main function
 */
async function main() {
  try {
    // Parse command line arguments
    const { inputFile, outputFormat } = parseArgs();
    
    console.log(`📂 Parsing SARIF file: ${inputFile}`);
    console.log(`📄 Output format: ${outputFormat}`);
    
    // Parse SARIF file
    const data = await parseSARIF(inputFile);
    console.log(`✅ Found ${data.stats.total} security findings`);
    
    // Format output based on requested format
    let output;
    let outputExt;
    
    switch (outputFormat.toLowerCase()) {
      case 'json':
        output = formatAsJSON(data);
        outputExt = '.json';
        break;
      case 'html':
        output = formatAsHTML(data);
        outputExt = '.html';
        break;
      case 'markdown':
      case 'md':
      default:
        output = formatAsMarkdown(data);
        outputExt = '.md';
    }
    
    // Generate output filename
    const inputBase = basename(inputFile, extname(inputFile));
    const outputFile = `${inputBase}-report${outputExt}`;
    
    // Write output file
    await writeFile(outputFile, output);
    console.log(`📝 Report written to: ${outputFile}`);
    
    // Print summary to console
    console.log('\n📊 Summary:');
    console.log(`   Total issues: ${data.stats.total}`);
    Object.entries(data.stats.bySeverity).forEach(([severity, count]) => {
      if (count > 0) {
        const emoji = Object.values(SEVERITY_MAP).find(s => s.label === severity)?.emoji || '';
        console.log(`   ${emoji} ${severity}: ${count}`);
      }
    });
    
    // Exit with error code if high severity issues found
    if (data.stats.bySeverity.HIGH > 0) {
      console.log('\n⚠️  High severity issues found!');
      exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    exit(1);
  }
}

// Run main function
main();