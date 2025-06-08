#!/usr/bin/env node

/**
 * Documentation Control & Synchronization Audit Script
 * 
 * This script audits the documentation against the current codebase,
 * excluding client-angular/ as specified in requirements.
 * It generates a comprehensive discrepancies report for documentation control.
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
 * Configuration object for the documentation audit
 */
const config = {
  rootDir: path.resolve(__dirname, '..'),
  
  // Directories to include in code analysis (excluding client-angular)
  includedCodeDirs: [
    'server',
    'client_angular2', 
    'scripts',
    'prisma',
    'generated',
    '.github'
  ],
  
  // Documentation directories to audit
  docDirs: [
    'docs'
  ],
  
  // Files to exclude from analysis
  excludePatterns: [
    'node_modules/',
    '.git/',
    'client-angular/', // Explicitly excluded per requirements
    'logs/',
    'coverage/',
    'dist/',
    'build/',
    '.next/',
    'temp',
    'tmp'
  ],
  
  // Code file extensions to analyze
  codeExtensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.yml', '.yaml'],
  
  // Documentation file extensions
  docExtensions: ['.md', '.markdown', '.html']
};

/**
 * Recursively scans a directory for files matching given extensions
 * @param {string} dir - Directory to scan
 * @param {string[]} extensions - File extensions to include
 * @param {string[]} excludePatterns - Patterns to exclude
 * @returns {string[]} Array of file paths
 */
function scanDirectory(dir, extensions, excludePatterns = []) {
  let results = [];
  
  try {
    if (!fs.existsSync(dir)) {
      return results;
    }
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      
      // Check if path should be excluded
      const shouldExclude = excludePatterns.some(pattern => 
        itemPath.includes(pattern)
      );
      
      if (shouldExclude) {
        continue;
      }
      
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        results = results.concat(scanDirectory(itemPath, extensions, excludePatterns));
      } else if (stat.isFile()) {
        const ext = path.extname(itemPath).toLowerCase();
        if (extensions.includes(ext)) {
          results.push(itemPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
  }
  
  return results;
}

/**
 * Analyzes code files to extract component/module/service names
 * @param {string[]} codeFiles - Array of code file paths
 * @returns {Object} Analysis results
 */
function analyzeCodeStructure(codeFiles) {
  const structure = {
    components: new Set(),
    services: new Set(),
    modules: new Set(),
    routes: new Set(),
    models: new Set(),
    controllers: new Set(),
    utilities: new Set(),
    configurations: new Set()
  };
  
  for (const filePath of codeFiles) {
    try {
      const fileName = path.basename(filePath, path.extname(filePath));
      const relativePath = path.relative(config.rootDir, filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Categorize based on file path and content
      if (relativePath.includes('component') || fileName.includes('component')) {
        structure.components.add(fileName);
      } else if (relativePath.includes('service') || fileName.includes('service')) {
        structure.services.add(fileName);
      } else if (relativePath.includes('module') || fileName.includes('module')) {
        structure.modules.add(fileName);
      } else if (relativePath.includes('route') || fileName.includes('route')) {
        structure.routes.add(fileName);
      } else if (relativePath.includes('model') || fileName.includes('model')) {
        structure.models.add(fileName);
      } else if (relativePath.includes('controller') || fileName.includes('controller')) {
        structure.controllers.add(fileName);
      } else if (relativePath.includes('util') || fileName.includes('util')) {
        structure.utilities.add(fileName);
      } else if (fileName.includes('config') || fileName.includes('setting')) {
        structure.configurations.add(fileName);
      }
      
      // TODO: Add more sophisticated content analysis
      // This could include parsing imports, exports, class definitions, etc.
      
    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error.message);
    }
  }
  
  // Convert Sets to Arrays for easier processing
  return {
    components: Array.from(structure.components),
    services: Array.from(structure.services),
    modules: Array.from(structure.modules),
    routes: Array.from(structure.routes),
    models: Array.from(structure.models),
    controllers: Array.from(structure.controllers),
    utilities: Array.from(structure.utilities),
    configurations: Array.from(structure.configurations)
  };
}

/**
 * Analyzes documentation files to identify what they document
 * @param {string[]} docFiles - Array of documentation file paths
 * @returns {Object} Documentation analysis results
 */
function analyzeDocumentation(docFiles) {
  const documentation = {
    documented: new Set(),
    outdated: [],
    missing: [],
    orphaned: []
  };
  
  for (const filePath of docFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath, path.extname(filePath));
      const relativePath = path.relative(config.rootDir, filePath);
      
      // Check if documentation references client-angular (should be flagged as outdated)
      if (content.includes('client-angular')) {
        documentation.outdated.push({
          file: relativePath,
          reason: 'References excluded client-angular directory'
        });
      }
      
      // TODO: Add more sophisticated content analysis
      // - Check for broken links
      // - Verify code examples still exist
      // - Check if mentioned files/modules still exist
      
      documentation.documented.add(fileName);
      
    } catch (error) {
      console.error(`Error analyzing documentation ${filePath}:`, error.message);
    }
  }
  
  return {
    documented: Array.from(documentation.documented),
    outdated: documentation.outdated,
    missing: documentation.missing,
    orphaned: documentation.orphaned
  };
}

/**
 * Compares code structure with documentation to find discrepancies
 * @param {Object} codeStructure - Analyzed code structure
 * @param {Object} docAnalysis - Analyzed documentation
 * @returns {Object} Discrepancies report
 */
function findDiscrepancies(codeStructure, docAnalysis) {
  const discrepancies = {
    undocumented: {
      components: [],
      services: [],
      modules: [],
      routes: [],
      models: [],
      controllers: [],
      utilities: [],
      configurations: []
    },
    outdated: docAnalysis.outdated,
    orphaned: [],
    summary: {}
  };
  
  // Find undocumented code elements
  for (const category in codeStructure) {
    const codeItems = codeStructure[category];
    const documented = docAnalysis.documented;
    
    for (const item of codeItems) {
      const isDocumented = documented.some(doc => 
        doc.toLowerCase().includes(item.toLowerCase()) ||
        item.toLowerCase().includes(doc.toLowerCase())
      );
      
      if (!isDocumented) {
        discrepancies.undocumented[category].push(item);
      }
    }
  }
  
  // Calculate summary statistics
  const totalUndocumented = Object.values(discrepancies.undocumented)
    .reduce((sum, arr) => sum + arr.length, 0);
  
  discrepancies.summary = {
    totalCodeElements: Object.values(codeStructure)
      .reduce((sum, arr) => sum + arr.length, 0),
    totalDocumented: docAnalysis.documented.length,
    totalUndocumented,
    totalOutdated: discrepancies.outdated.length,
    coveragePercentage: Math.round(
      ((docAnalysis.documented.length - totalUndocumented) / 
       Object.values(codeStructure).reduce((sum, arr) => sum + arr.length, 0)) * 100
    )
  };
  
  return discrepancies;
}

/**
 * Generates a comprehensive discrepancies report in markdown format
 * @param {Object} discrepancies - Discrepancies analysis results
 * @param {Object} codeStructure - Code structure analysis
 * @param {Object} docAnalysis - Documentation analysis
 * @returns {string} Markdown report
 */
function generateDiscrepanciesReport(discrepancies, codeStructure, docAnalysis) {
  const timestamp = new Date().toISOString();
  
  let report = `# Documentation Control & Synchronization Audit Report

Generated: ${timestamp}
Scope: Entire repository excluding client-angular/ directory

## Executive Summary

- **Total Code Elements Analyzed**: ${discrepancies.summary.totalCodeElements}
- **Total Documentation Files**: ${docAnalysis.documented.length}
- **Documentation Coverage**: ${discrepancies.summary.coveragePercentage}%
- **Undocumented Elements**: ${discrepancies.summary.totalUndocumented}
- **Outdated Documentation**: ${discrepancies.summary.totalOutdated}

## Undocumented Code Elements

These code elements lack proper documentation and should be prioritized:

`;

  // Add undocumented items by category
  for (const [category, items] of Object.entries(discrepancies.undocumented)) {
    if (items.length > 0) {
      report += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
      for (const item of items) {
        report += `- \`${item}\`\n`;
      }
      report += '\n';
    }
  }

  report += `## Outdated Documentation

These documentation files reference excluded directories or outdated information:

`;

  for (const outdated of discrepancies.outdated) {
    report += `- **${outdated.file}**: ${outdated.reason}\n`;
  }

  report += `
## Recommendations

### Immediate Actions Required:
1. Create documentation for ${discrepancies.summary.totalUndocumented} undocumented code elements
2. Update or archive ${discrepancies.summary.totalOutdated} outdated documentation files
3. Implement automated documentation synchronization

### Priority Order:
1. **High Priority**: Services and Controllers (core business logic)
2. **Medium Priority**: Components and Modules (user-facing functionality)  
3. **Low Priority**: Utilities and Configurations (supporting infrastructure)

## Implementation Plan

- [ ] Phase 1: Update outdated documentation
- [ ] Phase 2: Document high-priority undocumented elements
- [ ] Phase 3: Implement knowledge graph system
- [ ] Phase 4: Set up automated synchronization workflow

---
*This report was generated by the Documentation Control & Synchronization System*
`;

  return report;
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting Documentation Control & Synchronization Audit...');
    console.log(`📁 Root directory: ${config.rootDir}`);
    console.log(`🚫 Excluding: ${config.excludePatterns.join(', ')}`);
    
    // Scan code files (excluding client-angular)
    console.log('\n📊 Analyzing codebase structure...');
    let allCodeFiles = [];
    
    for (const dir of config.includedCodeDirs) {
      const fullPath = path.join(config.rootDir, dir);
      const files = scanDirectory(fullPath, config.codeExtensions, config.excludePatterns);
      allCodeFiles = allCodeFiles.concat(files);
      console.log(`  📂 ${dir}: ${files.length} files`);
    }
    
    console.log(`📝 Total code files analyzed: ${allCodeFiles.length}`);
    
    // Analyze code structure
    const codeStructure = analyzeCodeStructure(allCodeFiles);
    console.log('\n🔍 Code structure analysis complete:');
    for (const [category, items] of Object.entries(codeStructure)) {
      console.log(`  📋 ${category}: ${items.length} items`);
    }
    
    // Scan documentation files
    console.log('\n📚 Analyzing documentation...');
    let allDocFiles = [];
    
    for (const dir of config.docDirs) {
      const fullPath = path.join(config.rootDir, dir);
      const files = scanDirectory(fullPath, config.docExtensions, config.excludePatterns);
      allDocFiles = allDocFiles.concat(files);
      console.log(`  📂 ${dir}: ${files.length} files`);
    }
    
    console.log(`📖 Total documentation files: ${allDocFiles.length}`);
    
    // Analyze documentation
    const docAnalysis = analyzeDocumentation(allDocFiles);
    
    // Find discrepancies
    console.log('\n⚖️  Comparing code vs documentation...');
    const discrepancies = findDiscrepancies(codeStructure, docAnalysis);
    
    // Generate report
    const report = generateDiscrepanciesReport(discrepancies, codeStructure, docAnalysis);
    
    // Write report to file
    const outputPath = path.join(config.rootDir, 'docs', 'DOCUMENTATION_DISCREPANCIES_REPORT.md');
    fs.writeFileSync(outputPath, report);
    
    console.log(`\n✅ Audit complete!`);
    console.log(`📄 Report saved to: ${outputPath}`);
    console.log(`📊 Coverage: ${discrepancies.summary.coveragePercentage}%`);
    console.log(`⚠️  ${discrepancies.summary.totalUndocumented} undocumented elements found`);
    console.log(`🚨 ${discrepancies.summary.totalOutdated} outdated documentation files found`);
    
  } catch (error) {
    console.error('❌ Error during audit:', error);
    process.exit(1);
  }
}

// Execute the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { analyzeCodeStructure, analyzeDocumentation, findDiscrepancies };