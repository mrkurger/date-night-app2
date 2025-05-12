import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom implementations for missing Nebular modules
const customImplementations = {
  // For NbPaginator (replacement for MatPaginatorModule)
  NbPaginatorComponent: `
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nb-paginator',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="paginator-container">
      <button nbButton status="basic" [disabled]="page === 1" (click)="onPrevious()">
        Previous
      </button>
      <span class="page-info">
        Page {{page}} of {{totalPages()}}
      </span>
      <button nbButton status="basic" [disabled]="page >= totalPages()" (click)="onNext()">
        Next
      </button>
    </div>
  \`,
  styles: \`
    .paginator-container {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 1rem 0;
    }
    .page-info {
      margin: 0 1rem;
    }
  \`
})
export class NbPaginatorComponent {
  @Input() pageSize: number = 10;
  @Input() total: number = 0;
  @Input() page: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  onPrevious(): void {
    if (this.page > 1) {
      this.page--;
      this.pageChange.emit(this.page);
    }
  }

  onNext(): void {
    if (this.page < this.totalPages()) {
      this.page++;
      this.pageChange.emit(this.page);
    }
  }
}
`,

  // For NbSortComponent (replacement for MatSortModule)
  NbSortComponent: `
import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbButtonModule } from '@nebular/theme';

export interface NbSortEvent {
  active: string;
  direction: 'asc' | 'desc' | '';
}

@Component({
  selector: '[nbSort]',
  standalone: true,
  imports: [CommonModule, NbButtonModule],
  template: \`<ng-content></ng-content>\`,
})
export class NbSortComponent {
  @Input() active: string = '';
  @Input() direction: 'asc' | 'desc' | '' = '';
  @Output() sortChange = new EventEmitter<NbSortEvent>();

  sort(column: string): void {
    if (this.active === column) {
      this.direction = this.direction === 'asc' ? 'desc' : this.direction === 'desc' ? '' : 'asc';
    } else {
      this.active = column;
      this.direction = 'asc';
    }
    
    this.sortChange.emit({ active: this.active, direction: this.direction });
  }
}

@Component({
  selector: '[nbSortHeader]',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="nb-sort-header-container" (click)="sort()">
      <ng-content></ng-content>
      <div class="nb-sort-header-arrow" *ngIf="sorted">
        <span class="nb-sort-header-indicator" [class.asc]="ascending" [class.desc]="descending">
          {{ ascending ? '↑' : '↓' }}
        </span>
      </div>
    </div>
  \`,
  styles: \`
    .nb-sort-header-container {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    .nb-sort-header-arrow {
      margin-left: 6px;
    }
  \`
})
export class NbSortHeaderComponent {
  @Input() nbSortHeader: string = '';
  
  constructor(private sort: NbSortComponent) {}
  
  get sorted(): boolean {
    return this.sort.active === this.nbSortHeader && this.sort.direction !== '';
  }
  
  get ascending(): boolean {
    return this.sort.active === this.nbSortHeader && this.sort.direction === 'asc';
  }
  
  get descending(): boolean {
    return this.sort.active === this.nbSortHeader && this.sort.direction === 'desc';
  }
  
  sort(): void {
    this.sort.sort(this.nbSortHeader);
  }
}

export const NbSortModule = {
  declarations: [NbSortComponent, NbSortHeaderComponent],
  exports: [NbSortComponent, NbSortHeaderComponent]
};
`,

  // For NbDividerComponent (replacement for MatDividerModule)
  NbDividerComponent: `
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nb-divider',
  standalone: true,
  imports: [CommonModule],
  template: \`<div class="divider" [class.vertical]="vertical"></div>\`,
  styles: \`
    .divider {
      border-top: 1px solid #ccc;
      margin: 16px 0;
      width: 100%;
    }
    .vertical {
      border-top: none;
      border-left: 1px solid #ccc;
      margin: 0 16px;
      height: 100%;
      display: inline-block;
    }
  \`
})
export class NbDividerComponent {
  @Input() vertical: boolean = false;
}

export const NbDividerModule = {
  declarations: [NbDividerComponent],
  exports: [NbDividerComponent]
};
`,
};

// Find all TypeScript files
function findTsFiles(directory) {
  const files = [];

  function walk(dir) {
    const dirContents = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of dirContents) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  }

  walk(directory);
  return files;
}

// Check if component needs a custom implementation
function needsCustomImplementation(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for references to missing Nebular components
    const needsPaginator = /NbPaginatorModule|nb-paginator/.test(content);
    const needsSort = /NbSortModule|NbSortEvent|NbSortChangeEvent|nbSort/.test(content);
    const needsDivider = /NbDividerModule|nb-divider/.test(content);

    return {
      needsPaginator,
      needsSort,
      needsDivider,
    };
  } catch (error) {
    console.error(`Error checking if file needs custom implementation ${filePath}:`, error);
    return { needsPaginator: false, needsSort: false, needsDivider: false };
  }
}

// Create custom implementation components
function createCustomImplementations(componentDir) {
  const sharedComponentsDir = path.join(componentDir, 'shared', 'components');

  // Ensure the directory exists
  if (!fs.existsSync(sharedComponentsDir)) {
    fs.mkdirSync(sharedComponentsDir, { recursive: true });
  }

  // Create NbPaginatorComponent
  const paginatorDir = path.join(sharedComponentsDir, 'paginator');
  if (!fs.existsSync(paginatorDir)) {
    fs.mkdirSync(paginatorDir, { recursive: true });
  }

  const paginatorFile = path.join(paginatorDir, 'paginator.component.ts');
  fs.writeFileSync(paginatorFile, customImplementations.NbPaginatorComponent);
  console.log(`Created custom NbPaginatorComponent at ${paginatorFile}`);

  // Create NbSortComponent
  const sortDir = path.join(sharedComponentsDir, 'sort');
  if (!fs.existsSync(sortDir)) {
    fs.mkdirSync(sortDir, { recursive: true });
  }

  const sortFile = path.join(sortDir, 'sort.component.ts');
  fs.writeFileSync(sortFile, customImplementations.NbSortComponent);
  console.log(`Created custom NbSortComponent at ${sortFile}`);

  // Create NbDividerComponent
  const dividerDir = path.join(sharedComponentsDir, 'divider');
  if (!fs.existsSync(dividerDir)) {
    fs.mkdirSync(dividerDir, { recursive: true });
  }

  const dividerFile = path.join(dividerDir, 'divider.component.ts');
  fs.writeFileSync(dividerFile, customImplementations.NbDividerComponent);
  console.log(`Created custom NbDividerComponent at ${dividerFile}`);

  // Create a barrel file to export all components
  const barrelFile = path.join(sharedComponentsDir, 'custom-nebular-components.ts');
  const barrelContent = `
export * from './paginator/paginator.component';
export * from './sort/sort.component';
export * from './divider/divider.component';
`;
  fs.writeFileSync(barrelFile, barrelContent);
  console.log(`Created barrel file at ${barrelFile}`);
}

// Check and add imports for custom implementations where needed
function addCustomImplementationImports(filePath) {
  try {
    const needs = needsCustomImplementation(filePath);
    if (!needs.needsPaginator && !needs.needsSort && !needs.needsDivider) {
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Import path for custom components
    const importPath = '../../shared/components/custom-nebular-components';
    const relativePath = path.relative(
      path.dirname(filePath),
      path.join(__dirname, 'client-angular', 'src', 'app', 'shared', 'components'),
    );
    const actualImportPath = relativePath.replace(/\\/g, '/') + '/custom-nebular-components';

    // Add imports for needed components
    const imports = [];
    if (needs.needsPaginator) {
      imports.push('NbPaginatorComponent');
      changed = true;
    }
    if (needs.needsSort) {
      imports.push('NbSortComponent', 'NbSortHeaderComponent', 'NbSortEvent');
      changed = true;
    }
    if (needs.needsDivider) {
      imports.push('NbDividerComponent');
      changed = true;
    }

    if (changed) {
      // Add the import statement if needed
      const importStatement = `import { ${imports.join(', ')} } from '${actualImportPath}';\n`;

      // Check if the import already exists
      if (!content.includes(actualImportPath)) {
        // Add import statement after the last import
        const lastImportMatch = content.match(/^import .+;$/m);
        if (lastImportMatch) {
          const lastImportIndex =
            content.lastIndexOf(lastImportMatch[0]) + lastImportMatch[0].length;
          content =
            content.substring(0, lastImportIndex) +
            '\n' +
            importStatement +
            content.substring(lastImportIndex);
        } else {
          content = importStatement + content;
        }
      }

      // Add components to imports array in @Component decorator
      const componentDecorator = content.match(/@Component\s*\(\s*\{[\s\S]*?\}\s*\)/);
      if (componentDecorator) {
        const importsMatch = componentDecorator[0].match(/imports\s*:\s*\[([\s\S]*?)\]/);
        if (importsMatch) {
          const currentImports = importsMatch[1];
          const newImports = imports.filter(imp => !currentImports.includes(imp));

          if (newImports.length > 0) {
            const updatedImports = currentImports
              ? `${currentImports}${currentImports.trim().endsWith(',') ? ' ' : ', '}${newImports.join(', ')}`
              : newImports.join(', ');

            content = content.replace(
              /imports\s*:\s*\[([\s\S]*?)\]/,
              `imports: [${updatedImports}]`,
            );
          }
        }
      }

      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Added custom implementation imports to ${filePath}`);
    }
  } catch (error) {
    console.error(`Error adding custom implementation imports to ${filePath}:`, error);
  }
}

function main() {
  const clientAngularDir = path.join(__dirname, 'client-angular');
  const srcDir = path.join(clientAngularDir, 'src');

  // Create custom implementation components
  createCustomImplementations(srcDir);

  // Find all TypeScript files
  const tsFiles = findTsFiles(srcDir);
  console.log(`Found ${tsFiles.length} TypeScript files to check`);

  // Add imports for custom implementations where needed
  for (const file of tsFiles) {
    addCustomImplementationImports(file);
  }

  console.log('Completed adding missing Nebular modules');
}

main();
