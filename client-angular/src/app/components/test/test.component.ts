import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
@Component({
  selector: 'app-test-component',
  standalone: true,
  imports: [ButtonModule, CardModule],
  template: `
    <p-card>
      <p-card-header>Test Component</p-card-header>
      <p-card-body>
        <p-button>Click Me</p-button>
      </p-card-body>
    </p-card>
  `
})
export class TestComponent {
  // Component logic here
}