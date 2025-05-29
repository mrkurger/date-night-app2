import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

/**
 *
 */
@Component({
  selector: 'app-test-component',
  standalone: true,
  imports: [ButtonModule, CardModule],
  template: `
    <p-card>
      <h2>Test Component</h2>
      <p-button label="Click Me"></p-button>
    </p-card>
  `,
})
export class TestComponent {
  // Component logic here
}
