import fs from 'fs/promises';
import path from 'path';

/**
 * Migrates Bootstrap button classes in an HTML file to PrimeNG button directives and classes.
 * Specifically targets <button> elements with 'btn' classes.
 *
 * @param {string} filePath - The path to the HTML file to migrate.
 * @param {string} initialContent - The initial content of the file.
 * @returns {Promise<string>} - The modified content.
 */
async function migrateBootstrapButtonsInFile(filePath, initialContent) {
  console.log(`Attempting to migrate Bootstrap buttons in: ${filePath}`);
  let content = initialContent;

  // Step 1: Add pButton directive to <button> tags that have a 'btn' class
  // and don't already have pButton.
  content = content.replace(
    /<button((?![^>]*\bpButton\b)[^>]*)class="([^"]*\bbtn\b[^"]*)"/gi,
    (match, attributesBeforeClass, classValue) => {
      const separator = attributesBeforeClass.trim() === '' ? '' : ' ';
      return `<button${attributesBeforeClass}${separator}pButton class="${classValue}"`;
    },
  );

  // Step 2: Replace btn-specific classes with PrimeNG p-button classes or PrimeFlex utility classes.
  const classMappings = {
    'btn-primary': '', // pButton directive often implies primary by default.
    'btn-secondary': 'p-button-secondary',
    'btn-success': 'p-button-success',
    'btn-danger': 'p-button-danger',
    'btn-warning': 'p-button-warning',
    'btn-info': 'p-button-info',
    'btn-light': 'p-button-secondary',
    'btn-dark': 'p-button-contrast',
    'btn-link': 'p-button-link',
    'btn-lg': 'p-button-lg',
    'btn-sm': 'p-button-sm',
    'btn-block': 'w-full',
  };

  for (const [bsClass, ngClass] of Object.entries(classMappings)) {
    const regex = new RegExp(`\\b${bsClass}\\b`, 'gi');
    content = content.replace(regex, ngClass);
  }

  // Step 3: Remove the base 'btn' class
  const baseBtnRegex = new RegExp(`\\bbtn\\b`, 'gi');
  content = content.replace(baseBtnRegex, '');

  // Step 4: Cleanup class attributes
  content = content.replace(/class="([^"]*)"/g, (match, classValue) => {
    const cleanedClasses = classValue
      .trim()
      .split(/\s+/)
      .filter(c => c.trim() !== '')
      .join(' ');
    return cleanedClasses ? `class="${cleanedClasses}"` : '';
  });
  return content;
}

/**
 * Migrates Nebular nbButton directives in an HTML file to PrimeNG pButton directives and classes.
 * Targets <button nbButton...> and <a nbButton...> elements.
 *
 * @param {string} filePath - The path to the HTML file to migrate.
 * @param {string} initialContent - The initial content of the file.
 * @returns {Promise<string>} - The modified content.
 */
async function migrateNebularButtonsInFile(filePath, initialContent) {
  console.log(`Attempting to migrate Nebular nbButtons in: ${filePath}`);
  let content = initialContent;

  // Regex to find <button> or <a> tags with nbButton directive
  // It captures:
  // 1. Tag name (button or a)
  // 2. Attributes before nbButton
  // 3. The nbButton attribute itself and its potential value (though nbButton is usually valueless)
  // 4. Attributes after nbButton
  // 5. Inner HTML of the button/anchor
  const nebularButtonRegex =
    /<(button|a)((?:(?!(?:nbButton|\bpButton\b)).)*?)(\snbButton(?:="[^"]*")?)((?:(?!\/?>).)*?)>(.*?)<\/\1>/gis;

  content = content.replace(
    nebularButtonRegex,
    (match, tagName, attrsBefore, nbButtonAttr, attrsAfter, innerHTML) => {
      let primeNgClasses = [];
      let primeNgAttrs = [];
      let remainingNebularAttrs = attrsBefore + attrsAfter; // Combine for easier processing

      // Map Nebular status to PrimeNG classes
      const statusMatch = remainingNebularAttrs.match(/status="([^"]+)"/);
      if (statusMatch) {
        const status = statusMatch[1];
        switch (status) {
          case 'primary':
            primeNgClasses.push('p-button-primary');
            break;
          case 'success':
            primeNgClasses.push('p-button-success');
            break;
          case 'danger':
            primeNgClasses.push('p-button-danger');
            break;
          case 'warning':
            primeNgClasses.push('p-button-warning');
            break;
          case 'info':
            primeNgClasses.push('p-button-info');
            break;
          case 'basic':
            primeNgClasses.push('p-button-secondary');
            break;
          case 'control':
            primeNgClasses.push('p-button-secondary');
            break;
          // default: // No specific class for other statuses, rely on pButton base
        }
        remainingNebularAttrs = remainingNebularAttrs.replace(statusMatch[0], '');
      }

      // Map Nebular appearance to PrimeNG classes
      const appearanceMatch = remainingNebularAttrs.match(/appearance="([^"]+)"/);
      if (appearanceMatch) {
        const appearance = appearanceMatch[1];
        if (appearance === 'outline') primeNgClasses.push('p-button-outlined');
        if (appearance === 'ghost') primeNgClasses.push('p-button-text');
        // 'hero' is complex, might need manual styling. For now, no direct class.
        remainingNebularAttrs = remainingNebularAttrs.replace(appearanceMatch[0], '');
      }

      // Map Nebular size to PrimeNG classes
      const sizeMatch = remainingNebularAttrs.match(/size="([^"]+)"/);
      if (sizeMatch) {
        const size = sizeMatch[1];
        if (['tiny', 'small'].includes(size)) primeNgClasses.push('p-button-sm');
        if (['large', 'giant'].includes(size)) primeNgClasses.push('p-button-lg');
        remainingNebularAttrs = remainingNebularAttrs.replace(sizeMatch[0], '');
      }

      // Map Nebular shape to PrimeNG classes
      const shapeMatch = remainingNebularAttrs.match(/shape="([^"]+)"/);
      if (shapeMatch) {
        if (shapeMatch[1] === 'round') primeNgClasses.push('p-button-rounded');
        remainingNebularAttrs = remainingNebularAttrs.replace(shapeMatch[0], '');
      }

      // Handle fullWidth
      if (remainingNebularAttrs.includes('fullWidth')) {
        primeNgClasses.push('w-full'); // Assumes PrimeFlex
        remainingNebularAttrs = remainingNebularAttrs.replace(/\s*fullWidth(?:="[^"]*")?/, '');
      }

      // Handle icon attribute (simple pass-through for now, might need mapping)
      const iconMatch = remainingNebularAttrs.match(/icon="([^"]+)"/);
      let pButtonIcon = '';
      if (iconMatch) {
        // If Nebular icon was like "menu-outline", PrimeIcons are usually "pi pi-bars"
        // This needs a proper mapping table or manual adjustment.
        // For now, let's assume a direct pass-through or a placeholder.
        // A common PrimeNG pattern is to use `icon="pi pi-xxx"`
        // If innerHTML is empty or just an icon, it's an icon-only button.
        if (!innerHTML.trim() || innerHTML.trim().startsWith('<nb-icon')) {
          primeNgClasses.push('p-button-icon-only');
        }
        pButtonIcon = `icon="pi pi-${iconMatch[1]}"`; // Basic attempt, likely needs adjustment
        remainingNebularAttrs = remainingNebularAttrs.replace(iconMatch[0], '');
      }

      // Clean up remainingNebularAttrs: remove extra spaces
      remainingNebularAttrs = remainingNebularAttrs.trim().replace(/\s+/g, ' ');
      if (remainingNebularAttrs) primeNgAttrs.push(remainingNebularAttrs);

      // Construct the new button/anchor tag
      let classAttr = primeNgClasses.length > 0 ? `class="${primeNgClasses.join(' ')}"` : '';

      // Add label for PrimeNG button if innerHTML is not empty and not just an icon
      let labelAttr = '';
      const trimmedInnerHTML = innerHTML.trim();
      if (
        trimmedInnerHTML &&
        !trimmedInnerHTML.startsWith('<nb-icon') &&
        !trimmedInnerHTML.startsWith('<mat-icon')
      ) {
        labelAttr = `label="${trimmedInnerHTML.replace(/"/g, '&quot;')}"`; // Escape quotes in label
      }

      // If there's a label, PrimeNG pButton usually doesn't need innerHTML for the text.
      // However, if innerHTML contains other elements (like an icon component), keep it.
      let newInnerHTML = '';
      if (trimmedInnerHTML.startsWith('<nb-icon') || trimmedInnerHTML.startsWith('<mat-icon')) {
        newInnerHTML = innerHTML; // Keep original icon if it was there
      } else if (!labelAttr) {
        // If no label was created (e.g. icon only button from Nebular)
        newInnerHTML = innerHTML; // Keep original content (might be just an icon)
      }

      const allAttrs = ['pButton', labelAttr, pButtonIcon, ...primeNgAttrs, classAttr]
        .filter(Boolean)
        .join(' ');

      return `<${tagName} ${allAttrs}>${newInnerHTML}</${tagName}>`;
    },
  );

  return content;
}

async function processFile(filePath) {
  try {
    if (!filePath.endsWith('.html')) {
      console.log(`Skipping non-HTML file: ${filePath}`);
      return;
    }

    let fileContent = await fs.readFile(filePath, 'utf-8');
    const originalFileContent = fileContent;

    // Run Bootstrap button migration
    fileContent = await migrateBootstrapButtonsInFile(filePath, fileContent);

    // Run Nebular button migration
    fileContent = await migrateNebularButtonsInFile(filePath, fileContent);

    if (fileContent !== originalFileContent) {
      const migrationComment = `\n<!-- \n    This file was partially migrated to PrimeNG by an automated script (${new Date().toISOString()}).\n    It may have processed Bootstrap and/or Nebular buttons.\n    Please review the changes carefully, especially for:\n    1. Correct component behavior and visual appearance.\n    2. Ensuring necessary PrimeNG modules (e.g., ButtonModule from 'primeng/button') \n       are imported in the corresponding Angular component's NgModule or standalone component imports.\n    3. Handling any complex attributes, event bindings, or button types \n       not covered by this script.\n    4. Icon mapping (Nebular icons to PrimeIcons).\n    5. The use of 'w-full' for 'btn-block' or 'fullWidth' assumes PrimeFlex is available.\n-->\n`;
      const bodyEndTagIndex = fileContent.lastIndexOf('</body>');
      if (bodyEndTagIndex !== -1) {
        fileContent =
          fileContent.substring(0, bodyEndTagIndex) +
          migrationComment +
          fileContent.substring(bodyEndTagIndex);
      } else {
        fileContent += migrationComment;
      }
      await fs.writeFile(filePath, fileContent, 'utf-8');
      console.log(`Successfully processed and potentially migrated buttons in: ${filePath}`);
      console.log(
        `IMPORTANT: Remember to import ButtonModule from 'primeng/button' in the relevant Angular module/component for ${filePath}.`,
      );
    } else {
      console.log(
        `No applicable Bootstrap or Nebular button tags found or no changes made in: ${filePath}`,
      );
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`Error: File not found at ${filePath}`);
    } else {
      console.error(`Error processing file ${filePath}:`, error);
    }
  }
}

async function processDirectory(directoryPath) {
  console.log(`Processing directory: ${directoryPath}`);
  try {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(directoryPath, entry.name);
      if (entry.isDirectory()) {
        // Add exclusions for common directories like node_modules, .git, dist, etc.
        if (['node_modules', '.git', 'dist', 'coverage', 'e2e'].includes(entry.name)) {
          console.log(`Skipping directory: ${fullPath}`);
          continue;
        }
        await processDirectory(fullPath);
      } else if (entry.isFile()) {
        await processFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${directoryPath}:`, error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node migrate-to-primeng.js <file_or_directory_path>');
    console.log(
      'Example (file): node migrate-to-primeng.js src/app/some-component/some-component.html',
    );
    console.log('Example (directory): node migrate-to-primeng.js src/app');
    return;
  }

  const targetPath = args[0];

  try {
    const stats = await fs.stat(targetPath);
    if (stats.isFile()) {
      await processFile(targetPath);
    } else if (stats.isDirectory()) {
      await processDirectory(targetPath);
    } else {
      console.log('The provided path is neither a file nor a directory.');
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`Error: Path not found at ${targetPath}`);
    } else {
      console.error(`Error accessing path ${targetPath}:`, error);
    }
  }
}

main().catch(console.error);
