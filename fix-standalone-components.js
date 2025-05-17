import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find all TypeScript files
function findComponentFiles(directory) {
  const files = [];

  function walk(dir) {
    const dirContents = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of dirContents) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.component.ts')) {
        files.push(fullPath);
      }
    }
  }

  walk(directory);
  return files;
}

// Find all module files
function findModuleFiles(directory) {
  const files = [];

  function walk(dir) {
    const dirContents = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of dirContents) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.module.ts')) {
        files.push(fullPath);
      }
    }
  }

  walk(directory);
  return files;
}

// Check if component is standalone
function isStandaloneComponent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const standaloneRegex = /standalone\s*:\s*true/;
    return standaloneRegex.test(content);
  } catch (error) {
    console.error(`Error checking if component is standalone in ${filePath}:`, error);
    return false;
  }
}

// Extract component name from file path
function getComponentNameFromPath(filePath) {
  const fileName = path.basename(filePath, '.component.ts');
  // Convert kebab-case to PascalCase and add Component suffix
  const componentName =
    fileName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('') + 'Component';
  return componentName;
}

// Fix module declarations for standalone components
function fixModuleDeclarations(moduleFile, standaloneComponentNames) {
  try {
    let content = fs.readFileSync(moduleFile, 'utf8');
    let changed = false;

    for (const componentName of standaloneComponentNames) {
      // Find the component in the declarations array
      const declarationsRegex = new RegExp(
        `declarations\\s*:\\s*\\[([^\\]]*${componentName}[^\\]]*?)\\]`,
        's',
      );
      if (declarationsRegex.test(content)) {
        changed = true;

        // Remove the component from declarations and add to imports if not already there
        content = content.replace(declarationsRegex, (match, declarationsList) => {
          // Remove the component from declarations
          const updatedDeclarations = declarationsList
            .split(',')
            .map(item => item.trim())
            .filter(item => item !== componentName && item !== '')
            .join(', ');

          return `declarations: [${updatedDeclarations}]`;
        });

        // Add to imports if not already there
        const importsRegex = /imports\s*:\s*\[([\s\S]*?)\]/;
        if (importsRegex.test(content)) {
          content = content.replace(importsRegex, (match, importsList) => {
            if (!importsList.includes(componentName)) {
              const updatedImports = importsList
                ? `${importsList}, ${componentName}`
                : componentName;
              return `imports: [${updatedImports}]`;
            }
            return match;
          });
        } else {
          // If no imports array, add one
          const ngModuleRegex = /@NgModule\(\s*\{([\s\S]*?)\}\s*\)/;
          content = content.replace(ngModuleRegex, (match, moduleContent) => {
            if (!moduleContent.includes('imports:')) {
              return `@NgModule({\n  imports: [${componentName}],${moduleContent}})`;
            }
            return match;
          });
        }
      }
    }

    if (changed) {
      fs.writeFileSync(moduleFile, content, 'utf8');
      console.log(`Updated module declarations in ${moduleFile}`);
    }
  } catch (error) {
    console.error(`Error updating module declarations in ${moduleFile}:`, error);
  }
}

// Add CUSTOM_ELEMENTS_SCHEMA to standalone components
function addCustomElementsSchema(componentFile) {
  try {
    let content = fs.readFileSync(componentFile, 'utf8');

    // Check if CUSTOM_ELEMENTS_SCHEMA is already imported
    if (!content.includes('CUSTOM_ELEMENTS_SCHEMA')) {
      // Add import for CUSTOM_ELEMENTS_SCHEMA
      content = content.replace(
        /import\s*{([^}]*)}\s*from\s*['"]@angular\/core['"];/,
        (match, imports) => {
          const updatedImports = imports.includes('Component')
            ? `${imports}, CUSTOM_ELEMENTS_SCHEMA`
            : `${imports}, Component, CUSTOM_ELEMENTS_SCHEMA`;
          return `import {${updatedImports}} from '@angular/core';`;
        },
      );

      // Add schemas array to @Component decorator
      content = content.replace(/@Component\(\s*\{([\s\S]*?)\}\s*\)/, (match, componentContent) => {
        if (!componentContent.includes('schemas:')) {
          return `@Component({\n  ${componentContent},\n  schemas: [CUSTOM_ELEMENTS_SCHEMA]\n})`;
        }
        return match;
      });

      fs.writeFileSync(componentFile, content, 'utf8');
      console.log(`Added CUSTOM_ELEMENTS_SCHEMA to ${componentFile}`);
    }
  } catch (error) {
    console.error(`Error adding CUSTOM_ELEMENTS_SCHEMA to ${componentFile}:`, error);
  }
}

function main() {
  const clientAngularDir = path.join(__dirname, 'client-angular');
  const srcDir = path.join(clientAngularDir, 'src');

  // Find all component files
  const componentFiles = findComponentFiles(srcDir);
  console.log(`Found ${componentFiles.length} component files to check`);

  // Find all standalone components
  const standaloneComponents = [];
  for (const file of componentFiles) {
    if (isStandaloneComponent(file)) {
      standaloneComponents.push(file);
      // Add CUSTOM_ELEMENTS_SCHEMA to standalone components
      addCustomElementsSchema(file);
    }
  }
  console.log(`Found ${standaloneComponents.length} standalone components`);

  // Get component names
  const standaloneComponentNames = standaloneComponents.map(getComponentNameFromPath);

  // Find all module files
  const moduleFiles = findModuleFiles(srcDir);
  console.log(`Found ${moduleFiles.length} module files to check`);

  // Fix module declarations for standalone components
  for (const moduleFile of moduleFiles) {
    fixModuleDeclarations(moduleFile, standaloneComponentNames);
  }

  console.log('Completed fixing standalone component issues');
}

main();
