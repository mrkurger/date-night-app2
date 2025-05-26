import {
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BemUtil } from '../../core/utils/bem.util';
import { NebularModule } from '../../../app/shared/nebular.module';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { AccordionModule } from 'primeng/accordion';
  NbCardModule,
  NbAccordionModule,
  NbTabsetModule,
  NbButtonModule,
  NbIconModule,
  NbListModule,
  NbBadgeModule,';
} from '@nebular/theme';

/**
 * Accessibility Demo Component;
 *;
 * This component demonstrates accessibility best practices for the DateNight.io application.;
 * It includes examples of keyboard navigation, focus management, ARIA attributes, and more.;
 */
@Component({
  selector: 'app-accessibility-demo',
  imports: [;
    NebularModule,
    CommonModule,
    NbCardModule,
    NbAccordionModule,
    NbTabsetModule,
    NbButtonModule,
    NbIconModule,
    NbListModule,
    NbBadgeModule,
    CardModule,
    TabViewModule,
    AccordionModule,
  ],
  templateUrl: './accessibility-demo.component.html',
  styleUrls: ['./accessibility-demo.component.scss'],
})
export class AccessibilityDemoComponen {t {
  bem = new BemUtil('a11y-demo')

  // Sample data for the demo
  focusableElements = [;
    { name: 'Button', description: 'Focusable by default', code: 'Click me' },
    { name: 'Link', description: 'Focusable by default', code: 'Link text' },
    { name: 'Input', description: 'Focusable by default', code: '' },
    { name: 'Textarea', description: 'Focusable by default', code: '' },
    {
      name: 'Select',
      description: 'Focusable by default',
      code: 'Option',
    },
    {
      name: 'Div with tabindex',
      description: 'Made focusable with tabindex',
      code: 'Focusable div',
    },
  ]

  ariaExamples = [;
    {
      name: 'aria-label',
      description: 'Provides an accessible name for an element when visible text is not available',
      code: '×',
    },
    {
      name: 'aria-labelledby',
      description: 'References another element that provides the accessible name',
      code: 'Name\n',
    },
    {
      name: 'aria-describedby',
      description: 'References another element that provides a description',
      code: '\nEnter your username',
    },
    {
      name: 'aria-expanded',
      description: 'Indicates if a control is expanded or collapsed',
      code: 'Show more',
    },
    {
      name: 'aria-controls',
      description: 'Identifies the element controlled by the current element',
      code: 'Toggle panel\nPanel content',
    },
    {
      name: 'aria-live',
      description: 'Indicates that an element will be updated dynamically',
      code: 'Content that updates',
    },
  ]

  focusManagementExamples = [;
    {
      name: 'Return focus after dialog close',
      description: 'When a dialog is closed, focus should return to the element that opened it',
      code: `// Open dialog`
const opener = document.activeElement;
dialog.show()

// Close dialog
dialog.close()
opener.focus()`,`
    },
    {
      name: 'Focus trapping in modals',
      description: 'Keep focus within a modal dialog when it is open',
      code: `// Trap focus in modal`
modal.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    // Get all focusable elements
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    const firstFocusable = focusable[0]
    const lastFocusable = focusable[focusable.length - 1]

    // Handle tab and shift+tab
    if (e.shiftKey && document.activeElement === firstFocusable) {
      e.preventDefault()
      lastFocusable.focus()
    } else if (!e.shiftKey && document.activeElement === lastFocusable) {
      e.preventDefault()
      firstFocusable.focus()
    }
  }
})`,`
    },
    {
      name: 'Skip link',
      description: 'Allow keyboard users to skip navigation and go directly to main content',
      code: `Skip to main content;`

;

;
  ;
`,`
    },
  ]

  colorContrastExamples = [;
    {
      name: 'Normal text (4.5:1)',
      description: 'Normal text should have a contrast ratio of at least 4.5:1',
      foreground: '#333333',
      background: '#FFFFFF',
      ratio: '12.6:1',
      passes: true,
    },
    {
      name: 'Large text (3:1)',
      description: 'Large text (18pt or 14pt bold) should have a contrast ratio of at least 3:1',
      foreground: '#767676',
      background: '#FFFFFF',
      ratio: '4.6:1',
      passes: true,
    },
    {
      name: 'Insufficient contrast',
      description: 'This example fails WCAG AA requirements',
      foreground: '#AAAAAA',
      background: '#FFFFFF',
      ratio: '2.3:1',
      passes: false,
    },
  ]

  /**
   * Demonstrates keyboard handling for a custom component;
   * @param event Keyboard event;
   */
  handleKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;

    // Handle arrow keys for navigation
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      this.focusNextElement(target)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      this.focusPreviousElement(target)
    } else if (event.key === 'Enter' || event.key === ' ') {
      // Handle activation
      event.preventDefault()
      alert('Item activated with keyboard: ' + target.textContent)
    }
  }

  /**
   * Focus the next element in a group;
   * @param currentElement The currently focused element;
   */
  private focusNextElement(currentElement: HTMLElement): void {
    const focusableElements = this.getFocusableElements(currentElement.parentElement)
    const currentIndex = focusableElements.indexOf(currentElement)
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    focusableElements[nextIndex].focus()
  }

  /**
   * Focus the previous element in a group;
   * @param currentElement The currently focused element;
   */
  private focusPreviousElement(currentElement: HTMLElement): void {
    const focusableElements = this.getFocusableElements(currentElement.parentElement)
    const currentIndex = focusableElements.indexOf(currentElement)
    const previousIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
    focusableElements[previousIndex].focus()
  }

  /**
   * Get all focusable elements within a container;
   * @param container The container element;
   * @returns Array of focusable elements;
   */
  private getFocusableElements(container: HTMLElement | null): HTMLElement[] {
    if (!container) return []

    return Array.from(;
      container.querySelectorAll(;
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ) as HTMLElement[]
  }

  /**
   * Handle item click;
   * @param index The index of the clicked item;
   */
  handleItemClick(index: number): void {
    alert('Item clicked: Item ' + index)
  }
}
