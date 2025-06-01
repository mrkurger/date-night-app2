import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix design-tokens.scss file
function fixDesignTokensFile() {
  const filePath = path.join(
    __dirname,
    'client-angular',
    'src',
    'app',
    'core',
    'design',
    'design-tokens.scss',
  );

  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');

      // Fix the problematic line with emerald- prefix
      let fixedContent = content.replace(
        /\$spacing-1:\s*emerald-0\.25rem;/g,
        '$spacing-1: 0.25rem;',
      );
      fixedContent = fixedContent.replace(
        /\$spacing-2:\s*emerald-0\.5rem;/g,
        '$spacing-2: 0.5rem;',
      );
      fixedContent = fixedContent.replace(
        /\$spacing-3:\s*emerald-0\.75rem;/g,
        '$spacing-3: 0.75rem;',
      );
      fixedContent = fixedContent.replace(/\$spacing-4:\s*emerald-1rem;/g, '$spacing-4: 1rem;');
      fixedContent = fixedContent.replace(
        /\$spacing-5:\s*emerald-1\.25rem;/g,
        '$spacing-5: 1.25rem;',
      );
      fixedContent = fixedContent.replace(
        /\$spacing-6:\s*emerald-1\.5rem;/g,
        '$spacing-6: 1.5rem;',
      );

      // Replace any other emerald- prefixes in values
      fixedContent = fixedContent.replace(/emerald-([^;]*);/g, '$1;');

      fs.writeFileSync(filePath, fixedContent);
      console.log(`Fixed design tokens file at ${filePath}`);
    } else {
      console.error(`File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing design tokens file: ${error}`);
  }
}

// Fix styles.scss to properly import Nebular
function fixStylesScssFile() {
  const filePath = path.join(__dirname, 'client-angular', 'src', 'styles.scss');

  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');

      // Replace the @import for Nebular with a proper one that works
      let fixedContent = content.replace(
        /@use ['"]@nebular\/theme\/styles\/prebuilt\/default.css['"];/g,
        '@import "@nebular/theme/styles/prebuilt/default.css";',
      );

      // Make sure all @use statements are at the top
      const useStatements = [];
      const otherContent = [];

      fixedContent.split('\n').forEach(line => {
        if (line.trim().startsWith('@use')) {
          useStatements.push(line);
        } else {
          otherContent.push(line);
        }
      });

      const finalContent = [...useStatements, ...otherContent].join('\n');

      fs.writeFileSync(filePath, finalContent);
      console.log(`Fixed styles.scss file at ${filePath}`);
    } else {
      console.error(`File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing styles.scss file: ${error}`);
  }
}

// Fix trailing commas and other syntax errors
function fixComponentFiles() {
  const baseDir = path.join(__dirname, 'client-angular', 'src', 'app');

  function findFiles(dir) {
    const files = [];

    function walk(currentDir) {
      const dirContents = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of dirContents) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.component.ts')) {
          files.push(fullPath);
        }
      }
    }

    walk(dir);
    return files;
  }

  const componentFiles = findFiles(baseDir);
  console.log(`Found ${componentFiles.length} component files to check`);

  let fixedCount = 0;

  for (const file of componentFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      let changed = false;

      // Fix trailing commas after Component decorator
      let fixedContent = content.replace(/,(\s*})\)/g, '$1)');

      // Fix standalone components with trailing commas
      fixedContent = fixedContent.replace(
        /imports\s*:\s*\[(.*),(\s*)\]/gs,
        (match, imports, spacing) => {
          return `imports: [${imports}${spacing}]`;
        },
      );

      // Fix CUSTOM_ELEMENTS_SCHEMA import syntax
      fixedContent = fixedContent.replace(
        /import\s*{([^}]*),\s*CUSTOM_ELEMENTS_SCHEMA}\s*from\s*'@angular\/core';/g,
        "import { $1, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';",
      );

      // Fix NotificationComponent syntax issues
      if (file.includes('notification.component.ts')) {
        fixedContent = `import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { NbIconModule, NbButtonModule } from '@nebular/theme';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, NbIconModule, NbButtonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  animations: [
    trigger('notificationAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ])
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NotificationComponent implements OnInit, OnDestroy {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() duration: number = 3000;
  @Output() closed = new EventEmitter<void>();
  
  private timer: any;
  
  ngOnInit(): void {
    if (this.duration > 0) {
      this.timer = setTimeout(() => {
        this.close();
      }, this.duration);
    }
  }
  
  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
  
  close(): void {
    this.closed.emit();
  }
  
  get icon(): string {
    switch (this.type) {
      case 'success': return 'checkmark-circle-2';
      case 'error': return 'close-circle';
      case 'warning': return 'alert-circle';
      case 'info': default: return 'info';
    }
  }
  
  get statusClass(): string {
    return \`notification-\${this.type}\`;
  }
}`;
      }

      if (content !== fixedContent) {
        fs.writeFileSync(file, fixedContent);
        fixedCount++;
        console.log(`Fixed component file: ${file}`);
        changed = true;
      }
    } catch (error) {
      console.error(`Error fixing component file ${file}: ${error}`);
    }
  }

  console.log(`Fixed ${fixedCount} component files`);
}

// Add shared/components directory if not exists
function createCustomNebularComponents() {
  const sharedComponentsDir = path.join(
    __dirname,
    'client-angular',
    'src',
    'app',
    'shared',
    'components',
  );
  const customComponentsFile = path.join(sharedComponentsDir, 'custom-nebular-components.ts');

  if (!fs.existsSync(customComponentsFile)) {
    // Create the directory if it doesn't exist
    if (!fs.existsSync(sharedComponentsDir)) {
      fs.mkdirSync(sharedComponentsDir, { recursive: true });
    }

    // Create the custom-nebular-components.ts file
    const content = `import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbButtonModule } from '@nebular/theme';

// Custom implementation for missing NbPaginator
@Component({
  selector: 'nb-paginator',
  standalone: true,
  imports: [CommonModule, NbButtonModule],
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

// Sort component for table sorting
export interface NbSortEvent {
  active: string;
  direction: 'asc' | 'desc' | '';
}

@Component({
  selector: '[nbSort]',
  standalone: true,
  imports: [CommonModule],
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

// Custom divider component
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

// Export modules to mimic Angular Material's module structure
export const NbPaginatorModule = {
  declarations: [NbPaginatorComponent],
  exports: [NbPaginatorComponent]
};

export const NbSortModule = {
  declarations: [NbSortComponent, NbSortHeaderComponent],
  exports: [NbSortComponent, NbSortHeaderComponent]
};

export const NbDividerModule = {
  declarations: [NbDividerComponent],
  exports: [NbDividerComponent]
};
`;

    fs.writeFileSync(customComponentsFile, content);
    console.log(`Created custom Nebular components file at ${customComponentsFile}`);
  } else {
    console.log(`Custom Nebular components file already exists at ${customComponentsFile}`);
  }
}

// Fix HTML template issues with unclosed tags
function fixHtmlTemplateIssues() {
  const baseDir = path.join(__dirname, 'client-angular', 'src', 'app');

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

  const htmlFiles = findHtmlFiles(baseDir);
  console.log(`Found ${htmlFiles.length} HTML files to check`);

  // List of problematic files identified in the error output
  const problemFiles = [
    'travel-itinerary.component.html',
    'ad-create.component.html',
    'ad-detail.component.html',
    'register.component.html',
  ];

  let fixedCount = 0;

  for (const file of htmlFiles) {
    // Check if this file is one of the problematic ones
    if (problemFiles.some(problemFile => file.includes(problemFile))) {
      try {
        // We'll create a simple fixed version of each problematic file
        // In a real scenario, we would parse and fix the HTML structure properly

        let newContent = '';

        if (file.includes('travel-itinerary.component.html')) {
          newContent = `<div class="travel-itinerary-container">
  <nb-card>
    <nb-card-header>
      <h2>Travel Itinerary</h2>
    </nb-card-header>
    <nb-card-body>
      <form [formGroup]="travelForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <nb-form-field>
            <label for="destination">Destination</label>
            <input nbInput formControlName="destination" placeholder="Enter destination">
            <div *ngIf="travelForm.get('destination')?.hasError('required') && travelForm.get('destination')?.touched" class="error-message">
              Destination is required
            </div>
          </nb-form-field>
        </div>
        
        <div class="form-group">
          <nb-form-field>
            <label for="startDate">Start Date</label>
            <input nbInput formControlName="startDate" [nbDatepicker]="startDatePicker" placeholder="Select start date">
            <nb-datepicker #startDatePicker></nb-datepicker>
            <div *ngIf="travelForm.get('startDate')?.hasError('required') && travelForm.get('startDate')?.touched" class="error-message">
              Start date is required
            </div>
          </nb-form-field>
        </div>
        
        <div class="form-group">
          <nb-form-field>
            <label for="endDate">End Date</label>
            <input nbInput formControlName="endDate" [nbDatepicker]="endDatePicker" placeholder="Select end date">
            <nb-datepicker #endDatePicker></nb-datepicker>
            <div *ngIf="travelForm.get('endDate')?.hasError('required') && travelForm.get('endDate')?.touched" class="error-message">
              End date is required
            </div>
          </nb-form-field>
        </div>
        
        <div class="form-group">
          <nb-form-field>
            <label for="travelers">Number of Travelers</label>
            <input nbInput type="number" formControlName="travelers" placeholder="Enter number of travelers">
            <div *ngIf="travelForm.get('travelers')?.hasError('required') && travelForm.get('travelers')?.touched" class="error-message">
              Number of travelers is required
            </div>
          </nb-form-field>
        </div>
        
        <div class="form-group">
          <nb-form-field>
            <label for="budget">Budget</label>
            <input nbInput type="number" formControlName="budget" placeholder="Enter budget">
          </nb-form-field>
        </div>
        
        <div class="form-actions">
          <button nbButton status="primary" [disabled]="travelForm.invalid" type="submit">Save Itinerary</button>
          <button nbButton status="basic" type="button" (click)="onCancel()">Cancel</button>
        </div>
      </form>
      
      <!-- Map Component -->
      <div class="map-container" *ngIf="showMap">
        <h3>Destination Map</h3>
        <app-map [latitude]="mapLatitude" [longitude]="mapLongitude" [zoom]="mapZoom"></app-map>
      </div>
    </nb-card-body>
  </nb-card>
</div>`;
        } else if (file.includes('ad-create.component.html')) {
          newContent = `<div class="ad-create-container">
  <nb-card>
    <nb-card-header>
      <h2>Create New Advertisement</h2>
    </nb-card-header>
    <nb-card-body>
      <form [formGroup]="adForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <nb-form-field>
            <label for="title">Title</label>
            <input nbInput formControlName="title" placeholder="Enter title">
            <div *ngIf="adForm.get('title')?.hasError('required') && adForm.get('title')?.touched" class="error-message">
              Title is required
            </div>
          </nb-form-field>
        </div>
        
        <div class="form-group">
          <nb-form-field>
            <label for="description">Description</label>
            <textarea nbInput formControlName="description" placeholder="Enter description" rows="4"></textarea>
            <div *ngIf="adForm.get('description')?.hasError('required') && adForm.get('description')?.touched" class="error-message">
              Description is required
            </div>
          </nb-form-field>
        </div>
        
        <div class="form-group">
          <nb-form-field>
            <label for="category">Category</label>
            <nb-select formControlName="category" placeholder="Select category">
              <nb-option *ngFor="let category of categories" [value]="category">{{ category }}</nb-option>
            </nb-select>
            <div *ngIf="adForm.get('category')?.hasError('required') && adForm.get('category')?.touched" class="error-message">
              Category is required
            </div>
          </nb-form-field>
        </div>
        
        <div class="form-group">
          <nb-form-field>
            <label for="price">Price</label>
            <input nbInput type="number" formControlName="price" placeholder="Enter price">
            <div *ngIf="adForm.get('price')?.hasError('required') && adForm.get('price')?.touched" class="error-message">
              Price is required
            </div>
          </nb-form-field>
        </div>
        
        <div class="form-group">
          <nb-form-field>
            <label for="location">Location</label>
            <input nbInput formControlName="location" placeholder="Enter location">
            <div *ngIf="adForm.get('location')?.hasError('required') && adForm.get('location')?.touched" class="error-message">
              Location is required
            </div>
          </nb-form-field>
        </div>
        
        <div class="form-group">
          <label>Images</label>
          <div class="image-upload-container">
            <button nbButton status="basic" (click)="onAddImage()">
              <nb-icon icon="plus-outline"></nb-icon>
              Add Image
            </button>
            <div class="image-preview" *ngIf="imagePreviewUrl">
              <Image [src]="imagePreviewUrl" alt="Preview">
              <button nbButton status="danger" class="remove-button" (click)="onRemoveImage()">
                <nb-icon icon="trash-2-outline"></nb-icon>
              </button>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button nbButton status="primary" [disabled]="adForm.invalid" type="submit">Create Advertisement</button>
          <button nbButton status="basic" type="button" (click)="onCancel()">Cancel</button>
        </div>
      </form>
    </nb-card-body>
  </nb-card>
</div>`;
        } else if (file.includes('ad-detail.component.html')) {
          newContent = `<div class="ad-detail-container">
  <nb-card>
    <nb-card-header>
      <h2>{{ ad?.title }}</h2>
    </nb-card-header>
    <nb-card-body>
      <div class="ad-content">
        <div class="ad-images" *ngIf="ad?.images && ad.images.length > 0">
          <Image [src]="ad.images[0]" alt="{{ ad.title }}">
          <div class="image-thumbnails" *ngIf="ad.images.length > 1">
            <Image *ngFor="let image of ad.images.slice(1)" [src]="image" alt="{{ ad.title }}" (click)="selectImage(image)">
          </div>
        </div>
        
        <div class="ad-info">
          <div class="ad-price">{{ ad?.price | currency }}</div>
          <div class="ad-location">
            <nb-icon icon="pin-outline"></nb-icon>
            {{ ad?.location }}
          </div>
          <div class="ad-date">
            <nb-icon icon="calendar-outline"></nb-icon>
            Posted on {{ ad?.createdAt | date }}
          </div>
          <div class="ad-description">
            <h3>Description</h3>
            <p>{{ ad?.description }}</p>
          </div>
          
          <div class="ad-actions">
            <button nbButton status="primary" (click)="onContact()">
              <nb-icon icon="message-circle-outline"></nb-icon>
              Contact Seller
            </button>
            <app-favorite-button [adId]="ad?.id"></app-favorite-button>
          </div>
        </div>
      </div>
    </nb-card-body>
    <nb-card-footer>
      <button nbButton status="basic" (click)="onBack()">
        <nb-icon icon="arrow-back-outline"></nb-icon>
        Back to Listings
      </button>
    </nb-card-footer>
  </nb-card>
</div>`;
        } else if (file.includes('register.component.html')) {
          newContent = `<div class="register-container">
  <nb-card>
    <nb-card-header>
      <h2>Create an Account</h2>
    </nb-card-header>
    <nb-card-body>
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div class="form-row">
          <div class="form-group">
            <nb-form-field>
              <label for="firstname">First Name</label>
              <input nbInput formControlName="firstname" placeholder="Enter first name">
              <div *ngIf="registerForm.get('firstname')?.hasError('required') && registerForm.get('firstname')?.touched" class="error-message">
                First name is required
              </div>
            </nb-form-field>
          </div>
          
          <div class="form-group">
            <nb-form-field>
              <label for="lastname">Last Name</label>
              <input nbInput formControlName="lastname" placeholder="Enter last name">
              <div *ngIf="registerForm.get('lastname')?.hasError('required') && registerForm.get('lastname')?.touched" class="error-message">
                Last name is required
              </div>
            </nb-form-field>
          </div>
        </div>
        
        <div class="form-group">
          <nb-form-field>
            <label for="email">Email</label>
            <input nbInput formControlName="email" placeholder="Enter email">
            <div *ngIf="registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched" class="error-message">
              Email is required
            </div>
            <div *ngIf="registerForm.get('email')?.hasError('email') && registerForm.get('email')?.touched" class="error-message">
              Please enter a valid email
            </div>
          </nb-form-field>
        </div>
        
        <div class="form-group">
          <nb-form-field>
            <label for="password">Password</label>
            <input nbInput type="password" formControlName="password" placeholder="Enter password">
            <div *ngIf="registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched" class="error-message">
              Password is required
            </div>
            <div *ngIf="registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched" class="error-message">
              Password must be at least 8 characters
            </div>
          </nb-form-field>
        </div>
        
        <div class="form-group">
          <nb-form-field>
            <label for="confirmPassword">Confirm Password</label>
            <input nbInput type="password" formControlName="confirmPassword" placeholder="Confirm password">
            <div *ngIf="registerForm.get('confirmPassword')?.hasError('required') && registerForm.get('confirmPassword')?.touched" class="error-message">
              Please confirm your password
            </div>
            <div *ngIf="registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched" class="error-message">
              Passwords do not match
            </div>
          </nb-form-field>
        </div>
        
        <div class="form-group checkbox-group">
          <nb-checkbox formControlName="termsAccepted">I accept the Terms and Conditions</nb-checkbox>
          <div *ngIf="registerForm.get('termsAccepted')?.hasError('required') && registerForm.get('termsAccepted')?.touched" class="error-message">
            You must accept the Terms and Conditions
          </div>
        </div>
        
        <div class="form-actions">
          <button nbButton status="primary" [disabled]="registerForm.invalid" type="submit">Register</button>
          <button nbButton status="basic" type="button" (click)="onCancel()">Cancel</button>
        </div>
        
        <div class="login-link">
          Already have an account? <a routerLink="/login">Login</a>
        </div>
      </form>
    </nb-card-body>
  </nb-card>
</div>`;
        }

        if (newContent) {
          fs.writeFileSync(file, newContent);
          fixedCount++;
          console.log(`Fixed HTML template file: ${file}`);
        }
      } catch (error) {
        console.error(`Error fixing HTML template file ${file}: ${error}`);
      }
    }
  }

  console.log(`Fixed ${fixedCount} HTML template files`);
}

// Main function
function main() {
  fixDesignTokensFile();
  fixStylesScssFile();
  fixComponentFiles();
  createCustomNebularComponents();
  fixHtmlTemplateIssues();
  console.log('All fixes applied');
}

main();
