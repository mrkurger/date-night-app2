#!/usr/bin/env node

/**
 * Documentation Improvement Helper Script
 *
 * This script helps automate some of the documentation improvement tasks:
 * 1. Checks for files that need to be renamed to UPPERCASE.md format
 * 2. Finds internal links that need to be updated to use UPPERCASE.md format
 * 3. Identifies TODO comments in documentation files
 * 4. Generates a report of the current documentation status
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const REPORT_FILE = path.join(DOCS_DIR, 'DOCUMENTATION_STATUS_REPORT.md');
const EXCLUDED_DIRS = ['node_modules', '.git', 'dist', 'coverage'];

// Helper functions
function getAllMarkdownFiles(dir, fileList = []) {
  // Skip excluded directories or directories that don't exist
  if (EXCLUDED_DIRS.includes(path.basename(dir)) || !fs.existsSync(dir)) {
    return fileList;
  }

  try {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);

      try {
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          fileList = getAllMarkdownFiles(filePath, fileList);
        } else if (file.toLowerCase().endsWith('.md')) {
          fileList.push(filePath);
        }
      } catch (error) {
        // Skip files that can't be accessed
        console.warn(`Warning: Could not access ${filePath}: ${error.message}`);
      }
    });
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}: ${error.message}`);
  }

  return fileList;
}

function findFilesToRename() {
  const markdownFiles = getAllMarkdownFiles(DOCS_DIR);
  const filesToRename = [];

  markdownFiles.forEach(file => {
    const fileName = path.basename(file);
    const dirName = path.dirname(file);

    // Skip files that are already in UPPERCASE.md format
    if (fileName === fileName.toUpperCase() || fileName === 'README.md') {
      return;
    }

    filesToRename.push({
      currentPath: file,
      newPath: path.join(dirName, fileName.toUpperCase()),
    });
  });

  return filesToRename;
}

function findInternalLinksToUpdate() {
  const markdownFiles = getAllMarkdownFiles(ROOT_DIR);
  const linksToUpdate = [];

  markdownFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const linkRegex = /\[.*?\]\((?!https?:\/\/)([^)]+\.md)(?:#[^)]*)?\)/gi;
      let match;

      while ((match = linkRegex.exec(content)) !== null) {
        const linkPath = match[1];

        // Skip links that are already in UPPERCASE.md format
        if (
          path.basename(linkPath) === path.basename(linkPath).toUpperCase() ||
          path.basename(linkPath) === 'README.md'
        ) {
          continue;
        }

        linksToUpdate.push({
          file,
          link: match[0],
          linkPath,
          newLinkPath: linkPath.replace(
            path.basename(linkPath),
            path.basename(linkPath).toUpperCase()
          ),
        });
      }
    } catch (error) {
      console.warn(`Warning: Could not read file ${file}: ${error.message}`);
    }
  });

  return linksToUpdate;
}

function findTodoComments() {
  const markdownFiles = getAllMarkdownFiles(ROOT_DIR);
  const todoComments = [];

  markdownFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const todoRegex = /<!--\s*TODO:.*?-->/gi;
      let match;

      while ((match = todoRegex.exec(content)) !== null) {
        todoComments.push({
          file,
          comment: match[0],
          lineNumber: content.substring(0, match.index).split('\n').length,
        });
      }
    } catch (error) {
      console.warn(`Warning: Could not read file ${file}: ${error.message}`);
    }
  });

  return todoComments;
}

function generateReport() {
  const filesToRename = findFilesToRename();
  const linksToUpdate = findInternalLinksToUpdate();
  const todoComments = findTodoComments();

  let report = `# Documentation Status Report\n\n`;
  report += `Generated on: ${new Date().toISOString()}\n\n`;

  // Files to rename
  report += `## Files to Rename to UPPERCASE.md Format\n\n`;
  if (filesToRename.length === 0) {
    report += `No files need to be renamed.\n\n`;
  } else {
    report += `${filesToRename.length} files need to be renamed:\n\n`;
    filesToRename.forEach(file => {
      report += `- \`${file.currentPath.replace(ROOT_DIR + '/', '')}\` → \`${file.newPath.replace(ROOT_DIR + '/', '')}\`\n`;
    });
    report += `\n`;
  }

  // Links to update
  report += `## Internal Links to Update\n\n`;
  if (linksToUpdate.length === 0) {
    report += `No internal links need to be updated.\n\n`;
  } else {
    report += `${linksToUpdate.length} internal links need to be updated:\n\n`;

    // Group by file
    const fileGroups = {};
    linksToUpdate.forEach(link => {
      const relPath = link.file.replace(ROOT_DIR + '/', '');
      if (!fileGroups[relPath]) {
        fileGroups[relPath] = [];
      }
      fileGroups[relPath].push(link);
    });

    Object.keys(fileGroups).forEach(file => {
      report += `### ${file}\n\n`;
      fileGroups[file].forEach(link => {
        report += `- \`${link.link}\` → Replace with link using \`${path.basename(link.newLinkPath)}\`\n`;
      });
      report += `\n`;
    });
  }

  // TODO comments
  report += `## TODO Comments to Address\n\n`;
  if (todoComments.length === 0) {
    report += `No TODO comments found.\n\n`;
  } else {
    report += `${todoComments.length} TODO comments need to be addressed:\n\n`;

    // Group by file
    const fileGroups = {};
    todoComments.forEach(todo => {
      const relPath = todo.file.replace(ROOT_DIR + '/', '');
      if (!fileGroups[relPath]) {
        fileGroups[relPath] = [];
      }
      fileGroups[relPath].push(todo);
    });

    Object.keys(fileGroups).forEach(file => {
      report += `### ${file}\n\n`;
      fileGroups[file].forEach(todo => {
        report += `- Line ${todo.lineNumber}: \`${todo.comment}\`\n`;
      });
      report += `\n`;
    });
  }

  // Documentation statistics
  try {
    const totalFiles = getAllMarkdownFiles(ROOT_DIR).length;
    const docsFiles = getAllMarkdownFiles(DOCS_DIR).length;

    report += `## Documentation Statistics\n\n`;
    report += `- Total Markdown files in project: ${totalFiles}\n`;
    report += `- Markdown files in docs/ directory: ${docsFiles}\n`;
    report += `- Files to rename: ${filesToRename.length}\n`;
    report += `- Internal links to update: ${linksToUpdate.length}\n`;
    report += `- TODO comments to address: ${todoComments.length}\n`;
  } catch (error) {
    report += `## Documentation Statistics\n\n`;
    report += `Error generating complete statistics: ${error.message}\n\n`;
    report += `- Files to rename: ${filesToRename.length}\n`;
    report += `- Internal links to update: ${linksToUpdate.length}\n`;
    report += `- TODO comments to address: ${todoComments.length}\n`;
  }

  return report;
}

// Main execution
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Documentation Improvement Helper

Usage:
  node docs_improvement_helper.js [options]

Options:
  --report        Generate a documentation status report
  --rename        List files that need to be renamed
  --links         List internal links that need to be updated
  --todos         List TODO comments that need to be addressed
  --help, -h      Show this help message
    `);
    return;
  }

  if (args.includes('--report')) {
    const report = generateReport();
    fs.writeFileSync(REPORT_FILE, report);
    console.log(`Report generated at ${REPORT_FILE}`);
    return;
  }

  if (args.includes('--rename')) {
    const filesToRename = findFilesToRename();
    console.log(`Files to rename to UPPERCASE.md format (${filesToRename.length}):`);
    filesToRename.forEach(file => {
      console.log(
        `  ${file.currentPath.replace(ROOT_DIR + '/', '')} → ${file.newPath.replace(ROOT_DIR + '/', '')}`
      );
    });
    return;
  }

  if (args.includes('--links')) {
    const linksToUpdate = findInternalLinksToUpdate();
    console.log(`Internal links to update (${linksToUpdate.length}):`);
    linksToUpdate.forEach(link => {
      console.log(
        `  In ${link.file.replace(ROOT_DIR + '/', '')}: ${link.link} → Use ${path.basename(link.newLinkPath)}`
      );
    });
    return;
  }

  if (args.includes('--todos')) {
    const todoComments = findTodoComments();
    console.log(`TODO comments to address (${todoComments.length}):`);
    todoComments.forEach(todo => {
      console.log(
        `  In ${todo.file.replace(ROOT_DIR + '/', '')} line ${todo.lineNumber}: ${todo.comment}`
      );
    });
    return;
  }

  // Default: generate report
  const report = generateReport();
  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Report generated at ${REPORT_FILE}`);
}

main();
