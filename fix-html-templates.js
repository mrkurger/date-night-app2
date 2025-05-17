import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to find all HTML files
function findHtmlFiles(directory) {
  const files = [];

  function walk(dir) {
    const dirContents = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of dirContents) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        files.push(fullPath);
      }
    }
  }

  walk(directory);
  return files;
}

// Fix unclosed tags and other HTML issues
function fixHtmlIssues(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Fix unclosed nb-form-field tags
    const formFieldRegex = /<nb-form-field>([\s\S]*?)(?:<\/nb-form-field>)?(<nb-form-field>|$)/g;
    if (formFieldRegex.test(content)) {
      changed = true;
      content = content.replace(formFieldRegex, (match, inside, nextTag) => {
        if (!match.includes('</nb-form-field>')) {
          return `<nb-form-field>${inside}</nb-form-field>${nextTag}`;
        }
        return match;
      });
    }

    // Fix extra closing nb-form-field tags
    const extraClosingTagRegex = /<\/nb-form-field>(\s*<\/nb-form-field>)+/g;
    if (extraClosingTagRegex.test(content)) {
      changed = true;
      content = content.replace(extraClosingTagRegex, '</nb-form-field>');
    }

    // Fix unclosed form tags
    const formRegex = /<form[^>]*>([\s\S]*?)(?:<\/form>)?(<form|$)/g;
    if (formRegex.test(content)) {
      changed = true;
      content = content.replace(formRegex, (match, inside, nextTag) => {
        if (!match.includes('</form>')) {
          return `<form${match.substring(5, match.indexOf('>'))}>${inside}</form>${nextTag}`;
        }
        return match;
      });
    }

    // Fix extra closing form tags
    const extraClosingFormTagRegex = /<\/form>(\s*<\/form>)+/g;
    if (extraClosingFormTagRegex.test(content)) {
      changed = true;
      content = content.replace(extraClosingFormTagRegex, '</form>');
    }

    // Replace Material specific components with Nebular equivalents
    // mat-card -> nb-card
    content = content.replace(/<mat-card>/g, '<nb-card>');
    content = content.replace(/<\/mat-card>/g, '</nb-card>');
    content = content.replace(/<mat-card-content>/g, '<nb-card-body>');
    content = content.replace(/<\/mat-card-content>/g, '</nb-card-body>');
    content = content.replace(/<mat-card-title>/g, '<nb-card-header>');
    content = content.replace(/<\/mat-card-title>/g, '</nb-card-header>');
    content = content.replace(/<mat-card-actions>/g, '<nb-card-footer>');
    content = content.replace(/<\/mat-card-actions>/g, '</nb-card-footer>');

    // mat-form-field -> nb-form-field
    content = content.replace(/<mat-form-field>/g, '<nb-form-field>');
    content = content.replace(/<\/mat-form-field>/g, '</nb-form-field>');
    content = content.replace(/<mat-label>/g, '<nb-form-field-label>');
    content = content.replace(/<\/mat-label>/g, '</nb-form-field-label>');

    // mat-error -> div with error styling
    content = content.replace(/<mat-error>/g, '<div class="text-danger">');
    content = content.replace(/<\/mat-error>/g, '</div>');

    // mat-hint -> div with hint styling
    content = content.replace(/<mat-hint>/g, '<div class="hint-text">');
    content = content.replace(/<\/mat-hint>/g, '</div>');

    // Fix [color] attribute on buttons (not supported in Nebular the same way)
    content = content.replace(/\[color\]="([^"]*)"/g, 'status="primary" [class.basic]="!($1)"');

    // Replace mat-progress-spinner with nb-spinner
    content = content.replace(/<mat-progress-spinner/g, '<nb-spinner');
    content = content.replace(/<\/mat-progress-spinner>/g, '</nb-spinner>');

    // Replace mat-paginator with nb-paginator
    content = content.replace(/<mat-paginator/g, '<div class="paginator-container">');
    content = content.replace(/<\/mat-paginator>/g, '</div>');

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed HTML issues in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing HTML in ${filePath}:`, error);
  }
}

function main() {
  const clientAngularDir = path.join(__dirname, 'client-angular');
  const srcDir = path.join(clientAngularDir, 'src');
  const htmlFiles = findHtmlFiles(srcDir);

  console.log(`Found ${htmlFiles.length} HTML files to process`);
  let processedCount = 0;

  for (const file of htmlFiles) {
    fixHtmlIssues(file);
    processedCount++;
    if (processedCount % 20 === 0) {
      console.log(`Processed ${processedCount}/${htmlFiles.length} files`);
    }
  }

  console.log(`Completed processing ${processedCount} HTML files`);
}

main();
