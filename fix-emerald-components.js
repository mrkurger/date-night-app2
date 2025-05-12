import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Update HTML templates to use Nebular components
function updateHtmlTemplates(directory) {
  function findHtmlFiles(dir) {
    const files = [];
    function walk(currentDir) {
      const dirContents = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of dirContents) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
          files.push(fullPath);
        }
      }
    }
    walk(dir);
    return files;
  }

  const htmlFiles = findHtmlFiles(directory);
  console.log(`Found ${htmlFiles.length} HTML files`);

  const replacements = [
    // Buttons
    { pattern: /<button\s+mat-button/g, replacement: '<button nbButton' },
    { pattern: /<button\s+mat-raised-button/g, replacement: '<button nbButton status="primary"' },
    { pattern: /<button\s+mat-flat-button/g, replacement: '<button nbButton appearance="filled"' },
    {
      pattern: /<button\s+mat-stroked-button/g,
      replacement: '<button nbButton appearance="outline"',
    },
    { pattern: /<button\s+mat-icon-button/g, replacement: '<button nbButton ghost' },
    // Card
    { pattern: /<mat-card>/g, replacement: '<nb-card>' },
    { pattern: /<\/mat-card>/g, replacement: '</nb-card>' },
    { pattern: /<mat-card-header>/g, replacement: '<nb-card-header>' },
    { pattern: /<\/mat-card-header>/g, replacement: '</nb-card-header>' },
    { pattern: /<mat-card-content>/g, replacement: '<nb-card-body>' },
    { pattern: /<\/mat-card-content>/g, replacement: '</nb-card-body>' },
    { pattern: /<mat-card-actions>/g, replacement: '<nb-card-footer>' },
    { pattern: /<\/mat-card-actions>/g, replacement: '</nb-card-footer>' },
    // Form fields
    { pattern: /<mat-form-field>/g, replacement: '<nb-form-field>' },
    { pattern: /<\/mat-form-field>/g, replacement: '</nb-form-field>' },
    { pattern: /<mat-label>/g, replacement: '<nb-form-field-label>' },
    { pattern: /<\/mat-label>/g, replacement: '</nb-form-field-label>' },
    // Input
    { pattern: /matInput/g, replacement: 'nbInput fullWidth' },
    // Select
    { pattern: /<mat-select/g, replacement: '<nb-select' },
    { pattern: /<\/mat-select>/g, replacement: '</nb-select>' },
    { pattern: /<mat-option/g, replacement: '<nb-option' },
    { pattern: /<\/mat-option>/g, replacement: '</nb-option>' },
    // Checkbox
    { pattern: /<mat-checkbox/g, replacement: '<nb-checkbox' },
    { pattern: /<\/mat-checkbox>/g, replacement: '</nb-checkbox>' },
    // Tabs
    { pattern: /<mat-tab-group>/g, replacement: '<nb-tabset>' },
    { pattern: /<\/mat-tab-group>/g, replacement: '</nb-tabset>' },
    { pattern: /<mat-tab\s+label="([^"]+)">/g, replacement: '<nb-tab tabTitle="$1">' },
    { pattern: /<\/mat-tab>/g, replacement: '</nb-tab>' },
    // Progress spinner
    { pattern: /<mat-spinner/g, replacement: '<nb-spinner' },
    { pattern: /<\/mat-spinner>/g, replacement: '</nb-spinner>' },
    // Icon
    { pattern: /<mat-icon>/g, replacement: '<nb-icon icon="' },
    { pattern: /<\/mat-icon>/g, replacement: '"></nb-icon>' },
    // Table
    { pattern: /<mat-table/g, replacement: '<nb-table' },
    { pattern: /<\/mat-table>/g, replacement: '</nb-table>' },
    // Paginator
    { pattern: /<mat-paginator/g, replacement: '<nb-paginator' },
    { pattern: /<\/mat-paginator>/g, replacement: '</nb-paginator>' },
    // Emerald components to Nebular
    { pattern: /<app-card/g, replacement: '<nb-card' },
    { pattern: /<\/app-card>/g, replacement: '</nb-card>' },
    { pattern: /<card-grid>/g, replacement: '<div class="row">' },
    { pattern: /<\/card-grid>/g, replacement: '</div>' },
    { pattern: /<page-header/g, replacement: '<nb-card-header' },
    { pattern: /<\/page-header>/g, replacement: '</nb-card-header>' },
    { pattern: /<skeleton-loader/g, replacement: '<nb-card [nbSpinner]="true"' },
    { pattern: /<\/skeleton-loader>/g, replacement: '</nb-card>' },
    { pattern: /<app-label/g, replacement: '<span nbTooltip' },
    { pattern: /<\/app-label>/g, replacement: '</span>' },
    {
      pattern: /<floating-action-button/g,
      replacement: '<button nbButton shape="round" size="large" class="floating-button"',
    },
    { pattern: /<\/floating-action-button>/g, replacement: '</button>' },
    { pattern: /<toggle/g, replacement: '<nb-toggle' },
    { pattern: /<\/toggle>/g, replacement: '</nb-toggle>' },
  ];

  for (const file of htmlFiles) {
    console.log(`Processing ${file}`);
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    for (const { pattern, replacement } of replacements) {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
}

// Main function
function main() {
  const srcDir = path.join(__dirname, 'client-angular', 'src');
  updateHtmlTemplates(srcDir);
  console.log('HTML migration completed');
}

main();
