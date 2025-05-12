import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix issues in the app component
function fixAppComponent() {
  const filePath = path.join(__dirname, 'client-angular', 'src', 'app', 'app.component.ts');

  try {
    if (fs.existsSync(filePath)) {
      console.log(`Fixing app component at ${filePath}`);

      const content = `import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NbIconModule, NbButtonModule, NbLayoutModule, NbSidebarModule } from '@nebular/theme';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from './shared/shared.module';
import { NotificationComponent } from './shared/components/notification/notification.component';

interface NotificationMessage {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'date-night-app';
  notifications: NotificationMessage[] = [];
  
  constructor() {}
  
  ngOnInit(): void {
    // This could subscribe to a notification service
    // Example: this.notificationService.notifications$.subscribe(...)
  }
  
  showNotification(notification: NotificationMessage) {
    this.notifications.push(notification);
    
    if (notification.duration) {
      setTimeout(() => {
        this.removeNotification(notification);
      }, notification.duration);
    }
  }
  
  removeNotification(notification: NotificationMessage) {
    const index = this.notifications.indexOf(notification);
    if (index !== -1) {
      this.notifications.splice(index, 1);
    }
  }
}`;

      fs.writeFileSync(filePath, content);
      console.log('Fixed app component');
    } else {
      console.error(`File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing app component: ${error}`);
  }
}

// Add missing files for Notification component
function createNotificationComponent() {
  const componentPath = path.join(
    __dirname,
    'client-angular',
    'src',
    'app',
    'shared',
    'components',
    'notification',
  );
  const tsFilePath = path.join(componentPath, 'notification.component.ts');
  const htmlFilePath = path.join(componentPath, 'notification.component.html');
  const scssFilePath = path.join(componentPath, 'notification.component.scss');

  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(componentPath)) {
      fs.mkdirSync(componentPath, { recursive: true });
    }

    // Create HTML file
    const htmlContent = `<div class="notification-container" [@notificationAnimation]>
  <div class="notification" [ngClass]="statusClass">
    <nb-icon [icon]="icon" class="notification-icon"></nb-icon>
    <span class="notification-message">{{ message }}</span>
    <button nbButton ghost class="close-button" (click)="close()">
      <nb-icon icon="close-outline"></nb-icon>
    </button>
  </div>
</div>`;

    // Create SCSS file
    const scssContent = `@use '../../../core/design/design-tokens.scss' as *;

.notification-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
  min-width: 300px;
}

.notification {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  
  &.notification-success {
    background-color: #e8f5e9;
    border-left: 4px solid #4caf50;
  }
  
  &.notification-error {
    background-color: #ffebee;
    border-left: 4px solid #f44336;
  }
  
  &.notification-warning {
    background-color: #fff8e1;
    border-left: 4px solid #ffc107;
  }
  
  &.notification-info {
    background-color: #e3f2fd;
    border-left: 4px solid #2196f3;
  }
}

.notification-icon {
  margin-right: 12px;
  font-size: 20px;
  
  .notification-success & {
    color: #4caf50;
  }
  
  .notification-error & {
    color: #f44336;
  }
  
  .notification-warning & {
    color: #ffc107;
  }
  
  .notification-info & {
    color: #2196f3;
  }
}

.notification-message {
  flex: 1;
  font-size: 14px;
}

.close-button {
  padding: 0;
  margin-left: 8px;
  min-width: auto;
  height: auto;
  
  nb-icon {
    font-size: 16px;
  }
}`;

    // Only write files if they don't exist
    if (!fs.existsSync(htmlFilePath)) {
      fs.writeFileSync(htmlFilePath, htmlContent);
      console.log(`Created notification component HTML at ${htmlFilePath}`);
    }

    if (!fs.existsSync(scssFilePath)) {
      fs.writeFileSync(scssFilePath, scssContent);
      console.log(`Created notification component SCSS at ${scssFilePath}`);
    }

    // Always update the TS file since we fixed it already
    console.log(`Notification component files created/updated at ${componentPath}`);
  } catch (error) {
    console.error(`Error creating notification component: ${error}`);
  }
}

// Fix ad-management module issues
function fixAdManagementModule() {
  const filePath = path.join(
    __dirname,
    'client-angular',
    'src',
    'app',
    'features',
    'ad-management',
    'ad-management.module.ts',
  );

  try {
    if (fs.existsSync(filePath)) {
      console.log(`Fixing ad-management module at ${filePath}`);

      const content = `// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for ad-management.module settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { 
  NbTabsetModule, 
  NbButtonModule, 
  NbIconModule, 
  NbFormFieldModule, 
  NbInputModule, 
  NbSelectModule, 
  NbCheckboxModule, 
  NbDatepickerModule, 
  NbToastrModule, 
  NbSpinnerModule,
  NbCardModule,
  NbToggleModule,
  NbAutocompleteModule,
  NbRadioModule,
  NbAccordionModule,
  NbTagModule,
  NbTreeGridModule,
  NbUserModule,
  NbBadgeModule
} from '@nebular/theme';
import { SharedModule } from '../../shared/shared.module';
import { AdManagementComponent } from './ad-management.component';
import { AdFormComponent } from './ad-form/ad-form.component';
import { AdListComponent } from './ad-list/ad-list.component';
import { AdStatsComponent } from './ad-stats/ad-stats.component';
import { TravelItineraryComponent } from './travel-itinerary/travel-itinerary.component';
import { NbPaginatorModule, NbSortModule } from '../../shared/components/custom-nebular-components';

const routes: Routes = [
  {
    path: '',
    component: AdManagementComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: AdListComponent },
      { path: 'create', component: AdFormComponent },
      { path: 'edit/:id', component: AdFormComponent },
      { path: 'stats', component: AdStatsComponent },
      { path: 'travel', component: TravelItineraryComponent }
    ]
  }
];

@NgModule({
  declarations: [
    AdManagementComponent,
    AdFormComponent,
    AdListComponent,
    AdStatsComponent,
    TravelItineraryComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NbTabsetModule,
    NbButtonModule,
    NbIconModule,
    NbFormFieldModule,
    NbInputModule,
    NbSelectModule,
    NbCheckboxModule,
    NbDatepickerModule,
    NbToastrModule,
    NbSpinnerModule,
    NbCardModule,
    NbToggleModule,
    NbAutocompleteModule,
    NbRadioModule,
    NbAccordionModule,
    NbTagModule,
    NbTreeGridModule,
    NbUserModule,
    NbBadgeModule,
    SharedModule,
    NbPaginatorModule,
    NbSortModule
  ],
  exports: []
})
export class AdManagementModule { }`;

      fs.writeFileSync(filePath, content);
      console.log('Fixed ad-management module');
    } else {
      console.error(`File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ad-management module: ${error}`);
  }
}

// Fix the travel itinerary component
function fixTravelItineraryComponent() {
  const filePath = path.join(
    __dirname,
    'client-angular',
    'src',
    'app',
    'features',
    'ad-management',
    'travel-itinerary',
    'travel-itinerary.component.ts',
  );

  try {
    if (fs.existsSync(filePath)) {
      console.log(`Fixing travel itinerary component at ${filePath}`);

      const content = `import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-travel-itinerary',
  templateUrl: './travel-itinerary.component.html',
  styleUrls: ['./travel-itinerary.component.scss']
})
export class TravelItineraryComponent implements OnInit {
  travelForm: FormGroup;
  showMap = false;
  mapLatitude = 51.505;
  mapLongitude = -0.09;
  mapZoom = 13;
  
  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.travelForm = this.fb.group({
      destination: ['', Validators.required],
      startDate: [new Date(), Validators.required],
      endDate: [new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), Validators.required],
      travelers: [2, [Validators.required, Validators.min(1)]],
      budget: [1000]
    });
  }
  
  ngOnInit(): void {
    // Initialize the component
    this.travelForm.get('destination')?.valueChanges.subscribe(value => {
      if (value) {
        this.showMap = true;
        // In a real app, we would get coordinates from a geocoding service
        // For now, we'll just use default values
      } else {
        this.showMap = false;
      }
    });
  }
  
  onSubmit(): void {
    if (this.travelForm.valid) {
      // Process the form data
      console.log('Form submitted', this.travelForm.value);
      
      // Navigate back to the list
      this.router.navigate(['/ad-management/list']);
    } else {
      // Mark all fields as touched to trigger validation
      Object.keys(this.travelForm.controls).forEach(key => {
        const control = this.travelForm.get(key);
        control?.markAsTouched();
      });
    }
  }
  
  onCancel(): void {
    this.router.navigate(['/ad-management/list']);
  }
}`;

      fs.writeFileSync(filePath, content);
      console.log('Fixed travel itinerary component');
    } else {
      console.error(`File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing travel itinerary component: ${error}`);
  }
}

// Fix issues in ad-create component
function fixAdCreateComponent() {
  const filePath = path.join(
    __dirname,
    'client-angular',
    'src',
    'app',
    'features',
    'ads',
    'components',
    'ad-create',
    'ad-create.component.ts',
  );

  try {
    if (fs.existsSync(filePath)) {
      console.log(`Fixing ad-create component at ${filePath}`);

      const content = `import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NbButtonModule, NbCardModule, NbFormFieldModule, NbIconModule, NbInputModule, NbSelectModule } from '@nebular/theme';

@Component({
  selector: 'app-ad-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NbButtonModule, NbCardModule, NbFormFieldModule, NbIconModule, NbInputModule, NbSelectModule, RouterLink],
  templateUrl: './ad-create.component.html',
  styleUrls: ['./ad-create.component.scss']
})
export class AdCreateComponent implements OnInit {
  adForm: FormGroup;
  categories: string[] = ['Dating', 'Relationship', 'Short-term', 'Long-term', 'Casual', 'Serious'];
  imagePreviewUrl: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.adForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      location: ['', Validators.required],
      images: [[]]
    });
  }
  
  ngOnInit(): void {
    // Initialize the component
  }
  
  onSubmit(): void {
    if (this.adForm.valid) {
      // Process the form data
      console.log('Form submitted', this.adForm.value);
      
      // Navigate back to the list
      this.router.navigate(['/ads']);
    } else {
      // Mark all fields as touched to trigger validation
      Object.keys(this.adForm.controls).forEach(key => {
        const control = this.adForm.get(key);
        control?.markAsTouched();
      });
    }
  }
  
  onAddImage(): void {
    // In a real application, this would open a file picker
    // For now, we'll just set a dummy image URL
    this.imagePreviewUrl = 'https://via.placeholder.com/300x200';
    
    const images = this.adForm.get('images')?.value || [];
    images.push(this.imagePreviewUrl);
    this.adForm.get('images')?.setValue(images);
  }
  
  onRemoveImage(): void {
    this.imagePreviewUrl = null;
    this.adForm.get('images')?.setValue([]);
  }
  
  onCancel(): void {
    this.router.navigate(['/ads']);
  }
}`;

      fs.writeFileSync(filePath, content);
      console.log('Fixed ad-create component');
    } else {
      console.error(`File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ad-create component: ${error}`);
  }
}

// Fix ad-detail component
function fixAdDetailComponent() {
  const filePath = path.join(
    __dirname,
    'client-angular',
    'src',
    'app',
    'features',
    'ads',
    'components',
    'ad-detail',
    'ad-detail.component.ts',
  );

  try {
    if (fs.existsSync(filePath)) {
      console.log(`Fixing ad-detail component at ${filePath}`);

      const content = `import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NbButtonModule, NbCardModule, NbIconModule } from '@nebular/theme';

interface Ad {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  createdAt: Date;
  images: string[];
}

@Component({
  selector: 'app-ad-detail',
  standalone: true,
  imports: [CommonModule, NbButtonModule, NbCardModule, NbIconModule],
  templateUrl: './ad-detail.component.html',
  styleUrls: ['./ad-detail.component.scss']
})
export class AdDetailComponent implements OnInit {
  ad: Ad | null = null;
  selectedImage: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    // In a real app, we would fetch the ad from a service
    // For now, we'll just use dummy data
    this.ad = {
      id: Number(id) || 1,
      title: 'Beautiful Dinner Date Experience',
      description: 'Enjoy a wonderful dinner date at one of the most romantic restaurants in town. Perfect for anniversaries or special occasions.',
      price: 150,
      location: 'Downtown, City',
      createdAt: new Date(),
      images: [
        'https://via.placeholder.com/800x500',
        'https://via.placeholder.com/800x500/eee',
        'https://via.placeholder.com/800x500/ddd'
      ]
    };
    
    this.selectedImage = this.ad.images[0];
  }
  
  selectImage(image: string): void {
    this.selectedImage = image;
  }
  
  onContact(): void {
    // In a real app, this would open a contact dialog or navigate to a chat page
    console.log('Contact seller');
  }
  
  onBack(): void {
    this.router.navigate(['/ads']);
  }
}`;

      // Create the SCSS file if it doesn't exist
      const scssFilePath = path.join(
        __dirname,
        'client-angular',
        'src',
        'app',
        'features',
        'ads',
        'components',
        'ad-detail',
        'ad-detail.component.scss',
      );
      const scssContent = `.ad-content {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.ad-images {
  flex: 1;
  min-width: 300px;
  max-width: 600px;
  
  img {
    width: 100%;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .image-thumbnails {
    display: flex;
    gap: 8px;
    margin-top: 16px;
    overflow-x: auto;
    padding-bottom: 8px;
    
    img {
      width: 80px;
      height: 60px;
      object-fit: cover;
      cursor: pointer;
      transition: opacity 0.2s;
      
      &:hover {
        opacity: 0.8;
      }
    }
  }
}

.ad-info {
  flex: 1;
  min-width: 300px;
  
  .ad-price {
    font-size: 24px;
    font-weight: bold;
    color: #2196f3;
    margin-bottom: 16px;
  }
  
  .ad-location, .ad-date {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    color: #757575;
    
    nb-icon {
      margin-right: 8px;
    }
  }
  
  .ad-description {
    margin: 24px 0;
    
    h3 {
      margin-bottom: 12px;
      font-size: 18px;
    }
    
    p {
      line-height: 1.6;
    }
  }
  
  .ad-actions {
    display: flex;
    gap: 16px;
    margin-top: 24px;
  }
}`;

      fs.writeFileSync(filePath, content);
      fs.writeFileSync(scssFilePath, scssContent);

      console.log('Fixed ad-detail component and created SCSS file');
    } else {
      console.error(`File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ad-detail component: ${error}`);
  }
}

// Fix register component
function fixRegisterComponent() {
  const filePath = path.join(
    __dirname,
    'client-angular',
    'src',
    'app',
    'features',
    'auth',
    'register',
    'register.component.ts',
  );

  try {
    if (fs.existsSync(filePath)) {
      console.log(`Fixing register component at ${filePath}`);

      const content = `import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';

// Custom validator for password matching
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  
  return null;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      termsAccepted: [false, Validators.requiredTrue]
    }, { validators: passwordMatchValidator });
  }
  
  ngOnInit(): void {
    // Initialize the component
  }
  
  onSubmit(): void {
    if (this.registerForm.valid) {
      // Process the form data
      console.log('Registration form submitted', this.registerForm.value);
      
      // Navigate to login page
      this.router.navigate(['/login']);
    } else {
      // Mark all fields as touched to trigger validation
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
    }
  }
  
  onCancel(): void {
    this.router.navigate(['/login']);
  }
}`;

      fs.writeFileSync(filePath, content);
      console.log('Fixed register component');
    } else {
      console.error(`File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing register component: ${error}`);
  }
}

// Run all fixes
function runAllFixes() {
  console.log('Starting component fixes...');
  fixAppComponent();
  createNotificationComponent();
  fixAdManagementModule();
  fixTravelItineraryComponent();
  fixAdCreateComponent();
  fixAdDetailComponent();
  fixRegisterComponent();
  console.log('All component fixes completed!');
}

runAllFixes();
