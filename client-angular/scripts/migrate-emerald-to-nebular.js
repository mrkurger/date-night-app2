#!/usr/bin/env node

/* eslint-disable no-undef */
/**
 * Script to help migrate from Emerald UI to Nebular UI
 * This script will:
 * 1. Replace Emerald component selectors with Nebular equivalents
 * 2. Update class names to use Nebular conventions
 * 3. Update component imports
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Component mapping from Emerald to Nebular
const componentMap = {
  // Selectors
  'emerald-app-card-selector': 'nb-card',
  'emerald-avatar': 'nb-user',
  'emerald-pager-selector': 'nb-paginator',
  'emerald-card-grid-selector': 'nb-card-grid',
  'emerald-floating-action-button': 'nb-fab',
  'emerald-page-header': 'nb-header',
  'emerald-toggle': 'nb-toggle',
  'emerald-label': 'nb-tag',
  'emerald-skeleton-loader': 'nb-skeleton',
  'emerald-tinder-card': 'nb-flip-card',

  // Class names
  'emerald-card-grid': 'nb-card-grid',
  'emerald-card-grid--masonry': 'nb-card-grid-masonry',
  'emerald-card-grid__item': 'nb-card-grid-item',
  'emerald-card-grid__item--masonry': 'nb-card-grid-item-masonry',
  'emerald-card-grid--netflix': 'nb-card-grid-netflix',
  'emerald-card-grid__netflix-row': 'nb-card-grid-netflix-row',
  'emerald-card-grid__item--netflix': 'nb-card-grid-item-netflix',
  'emerald-card-grid__empty': 'nb-card-grid-empty',
  'emerald-pager': 'nb-paginator',
  'emerald-pager__button': 'nb-paginator-button',
  'emerald-pager__button--page': 'nb-paginator-page',
  'emerald-pager__button--next': 'nb-paginator-next',
  'emerald-pager__button--prev': 'nb-paginator-prev',
  'emerald-pager__button--active': 'nb-paginator-active',
  'emerald-pager__size-selector': 'nb-paginator-size-selector',
  'emerald-pager--simple': 'nb-paginator-simple',
  'emerald-pager--compact': 'nb-paginator-compact',
  'emerald-pager--small': 'nb-paginator-small',
  'emerald-pager--large': 'nb-paginator-large',
  'emerald-pager--left': 'nb-paginator-left',
  'emerald-pager--right': 'nb-paginator-right',
  'emerald-app-card': 'nb-card',
  'emerald-app-card__content': 'nb-card-body',
  'emerald-app-card__title': 'nb-card-header',
  'emerald-app-card__subtitle': 'nb-card-subtitle',
  'emerald-app-card__description': 'nb-card-text',
  'emerald-app-card__tags': 'nb-card-tags',
};

// Import mapping from Emerald to Nebular
const importMap = {
  '@emerald/core': '@nebular/theme',
  '@emerald/components': '@nebular/theme',
  '@emerald/icons': 'primeicons',
};

async function findFiles(dir, pattern) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  const results = [];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results.push(...(await findFiles(fullPath, pattern)));
    } else if (pattern.test(file.name)) {
      results.push(fullPath);
    }
  }

  return results;
}

async function replaceInFile(filePath) {
  let content = await fs.readFile(filePath, 'utf8');
  let modified = false;

  // Replace component selectors and class names
  for (const [emerald, nebular] of Object.entries(componentMap)) {
    const regex = new RegExp(emerald, 'g');
    if (content.match(regex)) {
      content = content.replace(regex, nebular);
      modified = true;
    }
  }

  // Replace imports
  for (const [emerald, nebular] of Object.entries(importMap)) {
    const importRegex = new RegExp(`from ['"]${emerald}.*['"]`, 'g');
    if (content.match(importRegex)) {
      content = content.replace(importRegex, `from '${nebular}'`);
      modified = true;
    }
  }

  if (modified) {
    await fs.writeFile(filePath, content, 'utf8');

    console.log(`Updated ${filePath}`);
  }
}

async function main() {
  const srcDir = path.join(__dirname, '..', 'src');
  const patterns = [/\.(ts|html|scss)$/];

  for (const pattern of patterns) {
    const files = await findFiles(srcDir, pattern);
    for (const file of files) {
      await replaceInFile(file);
    }
  }
}

main().catch(console.error);
