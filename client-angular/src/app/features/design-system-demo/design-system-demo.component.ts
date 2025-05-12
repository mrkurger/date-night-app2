// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (design-system-demo.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbInputModule,
  NbToggleModule,
  NbSelectModule,
  NbLayoutModule,
  NbFormFieldModule,
  NbSpinnerModule,
} from '@nebular/theme';

/**
 * Design System Demo Component
 *
 * A demonstration of the DateNight.io design system components.
 * This component showcases various components and their variants.
 */
@Component({
  selector: 'app-design-system-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbInputModule,
    NbToggleModule,
    NbSelectModule,
    NbLayoutModule,
    NbFormFieldModule,
    NbSpinnerModule,
  ],
  template: `
    <nb-card>
      <nb-card-header>
        <h1>Design System Demo</h1>
      </nb-card-header>
      <nb-card-body>
        <section class="section">
          <h2>Colors</h2>
          <div class="color-grid">
            <div class="color-sample" *ngFor="let color of colors">
              <div class="color-preview" [style.background-color]="color.value"></div>
              <div class="color-info">
                <span class="color-name">{{ color.name }}</span>
                <span class="color-value">{{ color.value }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>Typography</h2>
          <div class="typography-samples">
            <div class="typography-sample" *ngFor="let type of typography">
              <div class="sample-text" [style.font-size]="type.size">
                {{ type.name }}
              </div>
              <div class="sample-info">
                <span class="sample-name">{{ type.name }}</span>
                <span class="sample-value">{{ type.size }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>Spacing</h2>
          <div class="spacing-samples">
            <div class="spacing-sample" *ngFor="let space of spacing">
              <div class="space-preview" [style.width]="space.value"></div>
              <div class="space-info">
                <span class="space-name">{{ space.name }}</span>
                <span class="space-value">{{ space.value }}</span>
              </div>
            </div>
          </div>
        </section>
      </nb-card-body>
    </nb-card>
  `,
  styles: [
    `
      :host {
        display: block;
        padding: 2rem;
      }

      .section {
        margin-bottom: 3rem;
      }

      h1 {
        margin: 0;
        color: var(--text-basic-color);
      }

      h2 {
        margin: 0 0 1.5rem;
        color: var(--text-basic-color);
      }

      /* Color samples */
      .color-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1.5rem;
      }

      .color-sample {
        display: flex;
        flex-direction: column;
        border-radius: var(--border-radius);
        overflow: hidden;
        box-shadow: var(--shadow);
      }

      .color-preview {
        height: 100px;
      }

      .color-info {
        padding: 1rem;
        background-color: var(--background-basic-color-1);
      }

      .color-name {
        display: block;
        font-weight: 600;
        margin-bottom: 0.25rem;
      }

      .color-value {
        font-size: 0.875rem;
        color: var(--text-hint-color);
      }

      /* Typography samples */
      .typography-samples {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .typography-sample {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        background-color: var(--background-basic-color-1);
        border-radius: var(--border-radius);
      }

      .sample-text {
        flex: 1;
      }

      .sample-info {
        text-align: right;
      }

      .sample-name {
        display: block;
        font-weight: 600;
        margin-bottom: 0.25rem;
      }

      .sample-value {
        font-size: 0.875rem;
        color: var(--text-hint-color);
      }

      /* Spacing samples */
      .spacing-samples {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .spacing-sample {
        display: flex;
        align-items: center;
        gap: 1.5rem;
      }

      .space-preview {
        height: 24px;
        background-color: var(--color-primary-500);
        border-radius: var(--border-radius);
      }

      .space-info {
        flex: 1;
      }

      .space-name {
        display: block;
        font-weight: 600;
        margin-bottom: 0.25rem;
      }

      .space-value {
        font-size: 0.875rem;
        color: var(--text-hint-color);
      }
    `,
  ],
})
export class DesignSystemDemoComponent {
  colors = [
    { name: 'Primary', value: 'var(--color-primary-500)' },
    { name: 'Success', value: 'var(--color-success-500)' },
    { name: 'Warning', value: 'var(--color-warning-500)' },
    { name: 'Danger', value: 'var(--color-danger-500)' },
  ];

  typography = [
    { name: 'Heading 1', size: '2.5rem' },
    { name: 'Heading 2', size: '2rem' },
    { name: 'Heading 3', size: '1.75rem' },
    { name: 'Body', size: '1rem' },
    { name: 'Small', size: '0.875rem' },
  ];

  spacing = [
    { name: 'XS', value: '0.5rem' },
    { name: 'SM', value: '1rem' },
    { name: 'MD', value: '1.5rem' },
    { name: 'LG', value: '2rem' },
    { name: 'XL', value: '3rem' },
  ];
}
