import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// ...import shared components, directives, and pipes...

@NgModule({
  imports: [CommonModule],
  declarations: [
    // ...shared components and pipes...
  ],
  exports: [
    // ...export shared items for use in other modules...
  ]
})
export class SharedModule { }
