import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find all SCSS files
function findScssFiles(directory) {
  const files = [];

  function walk(dir) {
    const dirContents = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of dirContents) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.scss') || entry.name.endsWith('.sass'))) {
        files.push(fullPath);
      }
    }
  }

  walk(directory);
  return files;
}

// Fix SCSS imports
function fixScssImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Fix @import syntax to @use
    const importRegex = /@import\s+['"]([^'"]+)['"]\s*;/g;
    if (importRegex.test(content)) {
      changed = true;
      content = content.replace(importRegex, (match, importPath) => {
        return `@use '${importPath}' as *;`;
      });
    }

    // Fix references to emerald-ui
    if (content.includes('emerald-ui')) {
      changed = true;
      content = content.replace(/@(import|use)\s+['"].*emerald-ui.*['"]\s*;?/g, '');
    }

    // Fix tokens namespace issue
    if (content.includes('tokens.$')) {
      changed = true;
      content = content.replace(/tokens\.\$([a-zA-Z0-9-_]+)/g, (match, tokenName) => {
        // Map common tokens to CSS variables or direct values
        switch (tokenName) {
          case 'spacing-1':
            return '0.25rem';
          case 'spacing-2':
            return '0.5rem';
          case 'spacing-3':
            return '0.75rem';
          case 'spacing-4':
            return '1rem';
          case 'spacing-5':
            return '1.25rem';
          case 'spacing-6':
            return '1.5rem';
          case 'primary':
            return 'var(--primary-color)';
          case 'secondary':
            return 'var(--secondary-color)';
          case 'success':
            return 'var(--success-color)';
          case 'warning':
            return 'var(--warning-color)';
          case 'danger':
            return 'var(--danger-color)';
          case 'info':
            return 'var(--info-color)';
          default:
            return 'var(--' + tokenName + ')';
        }
      });
    }

    // Fix styles.scss
    if (filePath.endsWith('styles.scss')) {
      // Ensure Nebular theme is properly imported
      if (!content.includes('@nebular/theme/styles/prebuilt/default.css')) {
        content = `@use '@nebular/theme/styles/prebuilt/default.css';\n${content}`;
        changed = true;
      }

      // Fix themes import
      if (content.includes("@import 'themes';")) {
        content = content.replace("@import 'themes';", "@use 'themes' as *;");
        changed = true;
      }

      // Fix Nebular globals import
      if (content.includes("@import '@nebular/theme/styles/globals';")) {
        content = content.replace(
          "@import '@nebular/theme/styles/globals';",
          "@use '@nebular/theme/styles/globals' as nebular;",
        );
        changed = true;
      }

      if (content.includes("@import '@nebular/auth/styles/globals';")) {
        content = content.replace(
          "@import '@nebular/auth/styles/globals';",
          "@use '@nebular/auth/styles/globals' as nebular-auth;",
        );
        changed = true;
      }
    }

    // Fix themes.scss
    if (filePath.endsWith('themes.scss')) {
      // Add missing closing brace if present
      if (content.endsWith(')')) {
        content += ';';
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed SCSS imports in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing SCSS imports in ${filePath}:`, error);
  }
}

function main() {
  const clientAngularDir = path.join(__dirname, 'client-angular');
  const srcDir = path.join(clientAngularDir, 'src');
  const scssFiles = findScssFiles(srcDir);

  console.log(`Found ${scssFiles.length} SCSS files to process`);
  let processedCount = 0;

  for (const file of scssFiles) {
    fixScssImports(file);
    processedCount++;
    if (processedCount % 20 === 0) {
      console.log(`Processed ${processedCount}/${scssFiles.length} files`);
    }
  }

  console.log(`Completed processing ${processedCount} SCSS files`);
}

main();
