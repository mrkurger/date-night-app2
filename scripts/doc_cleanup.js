#!/usr/bin/env node

/**
 * Documentation Cleanup & Update Script
 * 
 * This script updates existing documentation to remove references to client-angular/
 * and align with the current codebase structure (excluding client-angular/).
 * It identifies and archives outdated content while preserving relevant information.
 * 
 * @author Documentation Control System
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuration for documentation cleanup
 */
const config = {
  rootDir: path.resolve(__dirname, '..'),
  
  // Documentation directories to process
  docDirs: ['docs'],
  
  // Archive directory for outdated content
  archiveDir: 'docs/outdated',
  
  // Patterns indicating outdated content
  outdatedPatterns: [
    'client-angular/',
    'client-angular',
    'src/app/features/',
    'emerald',
    'Emerald',
    'EMERALD',
    '@nebular/',
    'NbCard',
    'NbModule',
    'ng serve',
    'ng build',
    'Angular CLI',
    'karma',
    'jasmine'
  ],
  
  // Replacement mappings for updating content
  replacements: {
    'client-angular': 'client_angular2',
    'Angular': 'Next.js',
    'src/app/features/': 'client_angular2/app/',
    'Emerald UI': 'Radix UI + shadcn/ui',
    'emerald': 'radix-ui',
    '@nebular/': '@radix-ui/',
    'ng serve': 'npm run dev',
    'ng build': 'npm run build',
    'Angular CLI': 'Next.js CLI',
    'karma': 'playwright',
    'jasmine': 'jest'
  },
  
  // Files to exclude from processing
  excludeFiles: [
    'DOCUMENTATION_DISCREPANCIES_REPORT.md',
    'CURRENT_AUDIT.md',
    'ci_knowledge.md'
  ]
};

/**
 * Scans for documentation files that need cleanup
 * @param {string} dir - Directory to scan
 * @returns {string[]} Array of file paths that need updating
 */
function scanForOutdatedFiles(dir) {
  const outdatedFiles = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && !item.startsWith('.')) {
        // Recursively scan subdirectories
        outdatedFiles.push(...scanForOutdatedFiles(itemPath));
      } else if (stat.isFile() && 
                 (item.endsWith('.md') || item.endsWith('.markdown')) &&
                 !config.excludeFiles.includes(item)) {
        
        // Check if file contains outdated content
        const content = fs.readFileSync(itemPath, 'utf8');
        const hasOutdatedContent = config.outdatedPatterns.some(pattern => 
          content.includes(pattern)
        );
        
        if (hasOutdatedContent) {
          outdatedFiles.push(itemPath);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error scanning directory ${dir}:`, error.message);
  }
  
  return outdatedFiles;
}

/**
 * Analyzes a file to determine if it should be updated or archived
 * @param {string} filePath - Path to the file
 * @returns {Object} Analysis result with recommended action
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    const relativePath = path.relative(config.rootDir, filePath);
    
    let outdatedReferences = 0;
    let totalReferences = 0;
    let canBeUpdated = true;
    let issues = [];
    
    // Count outdated patterns
    for (const pattern of config.outdatedPatterns) {
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matches = (content.match(new RegExp(escapedPattern, 'gi')) || []).length;
      if (matches > 0) {
        outdatedReferences += matches;
        totalReferences += matches;
        
        // Check if this is a critical outdated reference that makes the file irrelevant
        if (pattern.includes('client-angular') && matches > 5) {
          canBeUpdated = false;
          issues.push(`Heavy client-angular references (${matches} instances)`);
        }
      }
    }
    
    // Check if file is entirely about excluded technology
    const angularSpecificTerms = ['angular', 'ng-', '@angular/', 'NgModule', 'Component decorator'];
    const angularReferences = angularSpecificTerms.reduce((count, term) => {
      return count + (content.match(new RegExp(term, 'gi')) || []).length;
    }, 0);
    
    if (angularReferences > 10) {
      canBeUpdated = false;
      issues.push(`File is heavily focused on excluded Angular technology`);
    }
    
    // Determine file relevance
    const isRelevant = content.length > 200 && 
                      !fileName.toLowerCase().includes('emerald') &&
                      !fileName.toLowerCase().includes('angular') &&
                      content.includes('TODO') === false; // Skip placeholder files
    
    return {
      filePath,
      relativePath,
      outdatedReferences,
      totalReferences,
      canBeUpdated: canBeUpdated && isRelevant,
      shouldArchive: !canBeUpdated || !isRelevant,
      issues,
      fileSize: content.length,
      isEmpty: content.trim().length < 100
    };
  } catch (error) {
    console.error(`❌ Error analyzing file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Updates a file by replacing outdated references with current equivalents
 * @param {string} filePath - Path to the file to update
 * @returns {boolean} Whether the file was successfully updated
 */
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Apply replacements
    for (const [oldTerm, newTerm] of Object.entries(config.replacements)) {
      const escapedTerm = oldTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedTerm, 'gi');
      if (regex.test(content)) {
        content = content.replace(regex, newTerm);
        updated = true;
      }
    }
    
    // Add update notice if content was modified
    if (updated) {
      const updateNotice = `
> **📝 Update Notice**: This documentation was automatically updated to reflect the current codebase structure. Some references to legacy technologies have been updated. Please review for accuracy.

`;
      
      // Insert update notice after the first heading
      content = content.replace(
        /^(# .+)\n/m,
        `$1\n${updateNotice}`
      );
      
      // Update last modified timestamp if present
      const timestamp = new Date().toISOString();
      content = content.replace(
        /\*\*Last Updated\*\*: .+/g,
        `**Last Updated**: ${timestamp}`
      );
      
      // If no timestamp exists, add one
      if (!content.includes('**Last Updated**')) {
        content = content.replace(
          /^(# .+)\n/m,
          `$1\n\n**Last Updated**: ${timestamp}\n`
        );
      }
      
      fs.writeFileSync(filePath, content);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error updating file ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Archives a file to the outdated directory
 * @param {string} filePath - Path to the file to archive
 * @returns {boolean} Whether the file was successfully archived
 */
function archiveFile(filePath) {
  try {
    const relativePath = path.relative(config.rootDir, filePath);
    const archiveDir = path.join(config.rootDir, config.archiveDir);
    
    // Create archive directory structure
    fs.mkdirSync(archiveDir, { recursive: true });
    
    // Generate archive file name with timestamp
    const fileName = path.basename(filePath);
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const archiveFileName = `${timestamp}-${fileName}`;
    const archivePath = path.join(archiveDir, archiveFileName);
    
    // Add archive header to content
    let content = fs.readFileSync(filePath, 'utf8');
    const archiveHeader = `> **🗄️ ARCHIVED DOCUMENTATION**
> 
> **Archived Date**: ${new Date().toISOString()}
> **Original Path**: \`${relativePath}\`
> **Reason**: Contains outdated references to excluded client-angular/ directory and legacy technologies
> 
> This documentation has been archived as part of the documentation cleanup process.
> If this content is still relevant, please create updated documentation that reflects the current codebase.

---

`;
    
    content = archiveHeader + content;
    
    // Write archived file
    fs.writeFileSync(archivePath, content);
    
    // Remove original file
    fs.unlinkSync(filePath);
    
    return true;
  } catch (error) {
    console.error(`❌ Error archiving file ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Generates a cleanup report
 * @param {Array} processed - Array of processed file results
 * @returns {string} Markdown report content
 */
function generateCleanupReport(processed) {
  const timestamp = new Date().toISOString();
  const updated = processed.filter(p => p.action === 'updated');
  const archived = processed.filter(p => p.action === 'archived');
  const skipped = processed.filter(p => p.action === 'skipped');
  
  let report = `# Documentation Cleanup Report

**Generated**: ${timestamp}
**Scope**: Cleanup of outdated documentation references

## Summary

- **Total Files Processed**: ${processed.length}
- **Files Updated**: ${updated.length}
- **Files Archived**: ${archived.length}
- **Files Skipped**: ${skipped.length}

## Updated Files

These files were updated to remove outdated references and align with current codebase:

`;

  for (const file of updated) {
    report += `- \`${file.relativePath}\`\n`;
    if (file.details) {
      report += `  - ${file.details}\n`;
    }
  }

  report += `\n## Archived Files

These files were archived due to heavy references to excluded technologies:

`;

  for (const file of archived) {
    report += `- \`${file.relativePath}\` → \`docs/outdated/${file.archiveFileName}\`\n`;
    if (file.reasons && file.reasons.length > 0) {
      report += `  - Reasons: ${file.reasons.join(', ')}\n`;
    }
  }

  report += `\n## Skipped Files

These files were skipped (already up to date or excluded):

`;

  for (const file of skipped) {
    report += `- \`${file.relativePath}\`\n`;
  }

  report += `
## Recommendations

### Follow-up Actions
1. Review updated files for accuracy and completeness
2. Check archived files for any content that should be preserved
3. Update internal links that may have been broken by archival
4. Consider creating new documentation for features that lost coverage

### Quality Assurance
- Run documentation validation tools
- Check for broken internal links
- Verify code examples still work
- Ensure updated documentation reflects current architecture

---
*Generated by Documentation Control & Synchronization System*
`;

  return report;
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🧹 Starting Documentation Cleanup...');
    console.log(`📁 Processing directories: ${config.docDirs.join(', ')}`);
    
    const processed = [];
    
    // Scan for outdated files
    console.log('\n🔍 Scanning for outdated documentation files...');
    let allOutdatedFiles = [];
    
    for (const docDir of config.docDirs) {
      const fullPath = path.join(config.rootDir, docDir);
      if (fs.existsSync(fullPath)) {
        const files = scanForOutdatedFiles(fullPath);
        allOutdatedFiles = allOutdatedFiles.concat(files);
        console.log(`  📂 ${docDir}: ${files.length} files with outdated content`);
      }
    }
    
    console.log(`📋 Total files to process: ${allOutdatedFiles.length}`);
    
    if (allOutdatedFiles.length === 0) {
      console.log('✅ No outdated files found. Documentation is up to date!');
      return;
    }
    
    // Process each file
    console.log('\n⚙️  Processing files...');
    
    for (const filePath of allOutdatedFiles) {
      const analysis = analyzeFile(filePath);
      
      if (!analysis) {
        continue;
      }
      
      const relativePath = analysis.relativePath;
      console.log(`\n📄 Processing: ${relativePath}`);
      
      if (analysis.isEmpty) {
        console.log(`  ⏭️  Skipping empty file`);
        processed.push({
          filePath,
          relativePath,
          action: 'skipped',
          reason: 'Empty or minimal content'
        });
        continue;
      }
      
      if (analysis.shouldArchive) {
        console.log(`  🗄️  Archiving (${analysis.issues.join(', ')})`);
        
        const archived = archiveFile(filePath);
        if (archived) {
          const archiveFileName = `${new Date().toISOString().slice(0, 10)}-${path.basename(filePath)}`;
          processed.push({
            filePath,
            relativePath,
            action: 'archived',
            archiveFileName,
            reasons: analysis.issues
          });
          console.log(`    ✅ Archived to docs/outdated/${archiveFileName}`);
        }
      } else if (analysis.canBeUpdated) {
        console.log(`  🔄 Updating (${analysis.outdatedReferences} outdated references)`);
        
        const updated = updateFile(filePath);
        if (updated) {
          processed.push({
            filePath,
            relativePath,
            action: 'updated',
            details: `Replaced ${analysis.outdatedReferences} outdated references`
          });
          console.log(`    ✅ Updated successfully`);
        } else {
          processed.push({
            filePath,
            relativePath,
            action: 'skipped',
            reason: 'No changes needed'
          });
          console.log(`    ⏭️  No changes needed`);
        }
      } else {
        console.log(`  ⏭️  Skipping (cannot be automatically updated)`);
        processed.push({
          filePath,
          relativePath,
          action: 'skipped',
          reason: 'Requires manual review'
        });
      }
    }
    
    // Generate and save cleanup report
    console.log('\n📊 Generating cleanup report...');
    const report = generateCleanupReport(processed);
    const reportPath = path.join(config.rootDir, 'docs', 'DOCUMENTATION_CLEANUP_REPORT.md');
    fs.writeFileSync(reportPath, report);
    
    console.log(`\n✅ Documentation cleanup complete!`);
    console.log(`📄 Report saved to: ${reportPath}`);
    console.log(`📊 Summary:`);
    console.log(`  🔄 Updated: ${processed.filter(p => p.action === 'updated').length} files`);
    console.log(`  🗄️  Archived: ${processed.filter(p => p.action === 'archived').length} files`);
    console.log(`  ⏭️  Skipped: ${processed.filter(p => p.action === 'skipped').length} files`);
    
  } catch (error) {
    console.error('❌ Error during documentation cleanup:', error);
    process.exit(1);
  }
}

// Execute the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { scanForOutdatedFiles, analyzeFile, updateFile, archiveFile };