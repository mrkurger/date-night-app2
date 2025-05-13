#!/usr/bin/env node

/**
 * Script to fix Angular core imports and decorators
 * This script will:
 * 1. Add missing Angular core imports
 * 2. Fix component decorators
 * 3. Fix lifecycle hooks
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const coreImports = {
  '@angular/core': [
    'Component',
    'OnInit',
    'OnDestroy',
    'Input',
    'Output',
    'EventEmitter',
    'ViewChild',
    'ViewEncapsulation',
    'ChangeDetectionStrategy',
    'Inject',
    'Injectable',
    'NgModule',
  ],
  '@angular/common': ['CommonModule'],
  '@angular/forms': ['ReactiveFormsModule', 'FormsModule'],
  '@angular/router': ['RouterModule', 'RouterLink'],
};

const nebularImports = {
  '@nebular/theme': [
    'NbDialogService',
    'NbDialogConfig',
    'NbDialogRef',
    'NbToastrService',
    'NbComponentStatus',
    'NbGlobalPosition',
    'NbToastrConfig',
    'NbThemeService',
    'NbLayoutDirection',
    'NbSidebarService',
    'NbMenuItem',
    'NbMenuService',
    'NbPaginationChangeEvent',
    'NbSortEvent',
    'NbTreeGridDataSource',
    'NbTreeGridDataSourceBuilder',
    'NbGetters',
    'NbTagComponent',
    'NbTagInputDirective',
    'NbAutocompleteDirective',
    'NbAutocompleteComponent',
    'NbOptionComponent',
    'NbLayoutComponent',
    'NbLayoutColumnComponent',
    'NbLayoutHeaderComponent',
    'NbLayoutFooterComponent',
    'NbSidebarComponent',
    'NbSidebarHeaderComponent',
    'NbMenuComponent',
    'NbMenuItemComponent',
    'NbCardComponent',
    'NbCardHeaderComponent',
    'NbCardBodyComponent',
    'NbCardFooterComponent',
    'NbTabsetComponent',
    'NbTabComponent',
    'NbAccordionComponent',
    'NbAccordionItemComponent',
    'NbAccordionItemHeaderComponent',
    'NbAccordionItemBodyComponent',
    'NbListComponent',
    'NbListItemComponent',
    'NbUserComponent',
    'NbBadgeComponent',
    'NbAlertComponent',
    'NbSpinnerComponent',
    'NbProgressBarComponent',
    'NbTooltipDirective',
    'NbPopoverDirective',
    'NbContextMenuDirective',
    'NbCheckboxComponent',
    'NbRadioComponent',
    'NbSelectComponent',
    'NbOptionGroupComponent',
    'NbInputDirective',
    'NbFormFieldComponent',
    'NbButtonComponent',
    'NbIconComponent',
    'NbToggleComponent',
    'NbActionComponent',
    'NbActionsComponent',
    'NbSearchComponent',
    'NbSearchService',
    'NbWindowComponent',
    'NbWindowService',
    'NbDialogComponent',
    'NbOverlayService',
    'NbPositionBuilderService',
    'NbTriggerStrategyBuilderService',
    'NbAdjustmentService',
    'NbScrollStrategyService',
    'NbOverlayPositionBuilder',
    'NbOverlayService',
    'NbLayoutScrollService',
    'NbLayoutRulerService',
    'NbViewportRulerAdapter',
    'NbPlatform',
    'NbOverlayContainer',
    'NbMenuInternalService',
    'NbFocusMonitor',
    'NbFocusTrap',
    'NbFocusTrapFactory',
  ],
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

async function fixImports(content) {
  let modified = false;
  let newContent = content;

  // Check for missing imports
  for (const [module, imports] of Object.entries(coreImports)) {
    for (const imp of imports) {
      if (content.includes(imp) && !content.includes(`import { ${imp} }`)) {
        // Check if we already have an import from this module
        const existingImport = new RegExp(`import {[^}]*} from '${module}'`);
        const match = content.match(existingImport);

        if (match) {
          // Add to existing import
          const importStatement = match[0];
          const newImport = importStatement.replace(
            /{([^}]*)}/,
            (_, current) => `{${current.includes(imp) ? current : `${current}, ${imp}`}}`,
          );
          newContent = newContent.replace(importStatement, newImport);
        } else {
          // Add new import
          const newImport = `import { ${imp} } from '${module}';\n`;
          newContent = newImport + newContent;
        }
        modified = true;
      }
    }
  }

  // Same for Nebular imports
  for (const [module, imports] of Object.entries(nebularImports)) {
    for (const imp of imports) {
      if (content.includes(imp) && !content.includes(`import { ${imp} }`)) {
        const existingImport = new RegExp(`import {[^}]*} from '${module}'`);
        const match = content.match(existingImport);

        if (match) {
          const importStatement = match[0];
          const newImport = importStatement.replace(
            /{([^}]*)}/,
            (_, current) => `{${current.includes(imp) ? current : `${current}, ${imp}`}}`,
          );
          newContent = newContent.replace(importStatement, newImport);
        } else {
          const newImport = `import { ${imp} } from '${module}';\n`;
          newContent = newImport + newContent;
        }
        modified = true;
      }
    }
  }

  // Fix component decorators
  if (content.includes('@Component') && !content.includes('standalone: true')) {
    newContent = newContent.replace(/@Component\({([^}]*)}\)/gs, (match, decoratorContent) => {
      if (!decoratorContent.includes('imports:')) {
        const lastBrace = decoratorContent.lastIndexOf('}');
        const newDecoratorContent =
          decoratorContent.slice(0, lastBrace) +
          ',\n  standalone: true,\n  imports: [CommonModule, ReactiveFormsModule, FormsModule]' +
          decoratorContent.slice(lastBrace);
        return `@Component({${newDecoratorContent}})`;
      }
      return match;
    });
    modified = true;
  }

  return { content: newContent, modified };
}

async function fixFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const { content: newContent, modified } = await fixImports(content);

  if (modified) {
    await fs.writeFile(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

async function main() {
  const srcDir = path.join(__dirname, '..', 'src');
  const pattern = /\.ts$/;

  const files = await findFiles(srcDir, pattern);
  for (const file of files) {
    await fixFile(file);
  }
}

main().catch(console.error);
