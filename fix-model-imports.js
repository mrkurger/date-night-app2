#!/usr/bin/env node

/**
 * This script fixes import issues in model files
 * after interface naming convention updates.
 * It ensures all "import { X } from './y'" statements
 * correctly reference the renamed interfaces with 'I' prefix.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDir = path.join(__dirname, 'client-angular');
const modelsDir = path.join(clientDir, 'src', 'app', 'core', 'models');

// Model files we know have been updated to use I-prefixed interfaces
const updatedInterfaces = {
  './ad.interface': ['Ad', 'IAd'],
  './user.interface': ['User', 'IUser'],
  './favorite.interface': [
    'Favorite',
    'IFavorite',
    'FavoriteCreateData',
    'IFavoriteCreateData',
    'FavoriteUpdateData',
    'IFavoriteUpdateData',
    'FavoriteFilterOptions',
    'IFavoriteFilterOptions',
    'FavoriteTag',
    'IFavoriteTag',
    'FavoriteBatchResult',
    'IFavoriteBatchResult',
  ],
  './profile.interface': ['Profile', 'IProfile', 'ProfileUpdateDTO', 'IProfileUpdateDTO'],
};

// Process each file in the models directory
async function processModelFiles() {
  try {
    const files = fs.readdirSync(modelsDir);

    console.log(`Found ${files.length} model files to check for import references`);

    let fixedCount = 0;

    for (const file of files) {
      if (file.endsWith('.ts')) {
        const filePath = path.join(modelsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        let newContent = content;

        // Check for imports that need to be updated
        for (const [importPath, replacements] of Object.entries(updatedInterfaces)) {
          for (let i = 0; i < replacements.length; i += 2) {
            const oldName = replacements[i];
            const newName = replacements[i + 1];

            // Replace import { X } from './y' with import { IX } from './y'
            const importRegex = new RegExp(
              `import\\s+{\\s*([^}]*)${oldName}([^}]*)\\s*}\\s*from\\s+['"]${importPath}['"]`,
              'g',
            );
            newContent = newContent.replace(importRegex, (match, before, after) => {
              modified = true;
              return `import { ${before}${newName}${after} } from '${importPath}'`;
            });

            // Replace references to the type in the file
            const typeRegex = new RegExp(`([^I])${oldName}([^a-zA-Z0-9_])`, 'g');
            newContent = newContent.replace(typeRegex, (match, before, after) => {
              modified = true;
              return `${before}${newName}${after}`;
            });
          }
        }

        if (modified) {
          fs.writeFileSync(filePath, newContent, 'utf8');
          console.log(`Updated imports in: ${file}`);
          fixedCount++;
        }
      }
    }

    console.log(`\nFixed imports in ${fixedCount} files.`);
  } catch (error) {
    console.error(`Error processing model files: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
processModelFiles();
