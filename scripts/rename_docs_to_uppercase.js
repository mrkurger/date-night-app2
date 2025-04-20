#!/usr/bin/env node

/**
 * Rename Documentation Files to UPPERCASE.md
 *
 * This script renames all .md files in the docs/ directory to UPPERCASE.md format,
 * except for README.md files. It also updates internal links in all .md files
 * to use the new UPPERCASE.md filenames.
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define paths - ES module compatible way
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const EXCLUDED_DIRS = ['node_modules', '.git', 'dist', 'coverage'];
const EXCLUDED_FILES = ['README.md'];
const DRY_RUN = process.argv.includes('--dry-run');

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

    // Skip excluded files and files that are already in UPPERCASE.md format
    if (EXCLUDED_FILES.includes(fileName) || fileName === fileName.toUpperCase()) {
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
        const linkBasename = path.basename(linkPath);

        // Skip links that are already in UPPERCASE.md format or excluded files
        if (EXCLUDED_FILES.includes(linkBasename) || linkBasename === linkBasename.toUpperCase()) {
          continue;
        }

        linksToUpdate.push({
          file,
          link: match[0],
          linkPath,
          newLinkPath: linkPath.replace(linkBasename, linkBasename.toUpperCase()),
        });
      }
    } catch (error) {
      console.warn(`Warning: Could not read file ${file}: ${error.message}`);
    }
  });

  return linksToUpdate;
}

function renameFiles(filesToRename) {
  console.log(`\nRenaming ${filesToRename.length} files to UPPERCASE.md format:`);

  filesToRename.forEach(file => {
    const relativeCurrent = file.currentPath.replace(ROOT_DIR + '/', '');
    const relativeNew = file.newPath.replace(ROOT_DIR + '/', '');

    console.log(`  ${relativeCurrent} → ${relativeNew}`);

    if (!DRY_RUN) {
      try {
        // Use git mv if the file is tracked by git
        try {
          execSync(`git ls-files --error-unmatch "${relativeCurrent}"`, { stdio: 'ignore' });
          execSync(`git mv "${relativeCurrent}" "${relativeNew}"`);
        } catch (e) {
          // File is not tracked by git, use regular fs.renameSync
          fs.renameSync(file.currentPath, file.newPath);
        }
      } catch (error) {
        console.error(`    Error renaming file: ${error.message}`);
      }
    }
  });
}

function updateInternalLinks(linksToUpdate) {
  console.log(`\nUpdating ${linksToUpdate.length} internal links to use UPPERCASE.md format:`);

  // Group by file
  const fileGroups = {};
  linksToUpdate.forEach(link => {
    const relPath = link.file.replace(ROOT_DIR + '/', '');
    if (!fileGroups[relPath]) {
      fileGroups[relPath] = [];
    }
    fileGroups[relPath].push(link);
  });

  Object.keys(fileGroups).forEach(filePath => {
    console.log(`  In ${filePath}:`);
    const fullPath = path.join(ROOT_DIR, filePath);

    if (!fs.existsSync(fullPath)) {
      console.warn(`    Warning: File does not exist: ${fullPath}`);
      return;
    }

    if (!DRY_RUN) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');

        fileGroups[filePath].forEach(link => {
          const oldLink = link.link;
          const newLink = oldLink.replace(
            path.basename(link.linkPath),
            path.basename(link.newLinkPath)
          );

          console.log(`    ${oldLink} → ${newLink}`);
          content = content.replace(oldLink, newLink);
        });

        try {
          fs.writeFileSync(fullPath, content);
        } catch (error) {
          console.error(`    Error updating links in ${filePath}: ${error.message}`);
        }
      } catch (error) {
        console.warn(`    Warning: Could not read file ${filePath}: ${error.message}`);
      }
    } else {
      fileGroups[filePath].forEach(link => {
        console.log(
          `    ${link.link} → Replace with link using ${path.basename(link.newLinkPath)}`
        );
      });
    }
  });
}

// Main execution
function main() {
  console.log('Documentation File Renaming Tool');
  console.log('================================');

  if (DRY_RUN) {
    console.log('Running in DRY RUN mode. No files will be modified.');
  }

  const filesToRename = findFilesToRename();
  const linksToUpdate = findInternalLinksToUpdate();

  if (filesToRename.length === 0 && linksToUpdate.length === 0) {
    console.log(
      '\nNo files to rename or links to update. All documentation files are already in UPPERCASE.md format.'
    );
    return;
  }

  if (filesToRename.length > 0) {
    renameFiles(filesToRename);
  } else {
    console.log('\nNo files need to be renamed to UPPERCASE.md format.');
  }

  if (linksToUpdate.length > 0) {
    updateInternalLinks(linksToUpdate);
  } else {
    console.log('\nNo internal links need to be updated.');
  }

  console.log('\nDone!');

  if (DRY_RUN) {
    console.log(
      '\nThis was a dry run. To actually perform these changes, run the script without the --dry-run flag:'
    );
    console.log('  node scripts/rename_docs_to_uppercase.js');
  } else {
    console.log('\nAll files have been renamed and internal links have been updated.');
    console.log('Please review the changes and commit them to the repository.');
  }
}

main();
