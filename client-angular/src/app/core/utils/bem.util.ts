import { Component } from '@angular/core';
/**
 * BEM Utility
 *
 * This utility helps implement BEM naming conventions in Angular components.
 * BEM stands for Block, Element, Modifier.
 *
 * Usage:
 * ```typescript
 * import { BemUtil } from '@core/utils/bem.util';
 *
 * @Component({
 *   selector: 'app-card',
 *   template: `
 *     <div [class]="bem.block()">
 *       <div [class]="bem.element('header')">
 *         <h2 [class]="bem.element('title')">Card Title</h2>
 *       </div>
 *       <div [class]="bem.element('content', ['padded', isActive ? 'active' : ''])">
 *         <p [class]="bem.element('text')">Card content</p>
 *       </div>
 *     </div>
 *   `
 *,
  standalone: true,
  imports: [] })
 * export class CardComponent {
 *   bem = new BemUtil('card');
 *   isActive = false;
 * }
 * ```
 */
export class BemUtil {
  /**
   * Creates a new BEM utility instance
   * @param blockName The name of the BEM block
   */
  constructor(private blockName: string) {}

  /**
   * Generates a BEM block class name
   * @param modifiers Optional array of modifiers
   * @returns BEM block class name with optional modifiers
   */
  block(modifiers?: string[]): string {
    return this.generateClassNames(this.blockName, null, modifiers);
  }

  /**
   * Generates a BEM element class name
   * @param elementName The name of the element
   * @param modifiers Optional array of modifiers
   * @returns BEM element class name with optional modifiers
   */
  element(elementName: string, modifiers?: string[]): string {
    return this.generateClassNames(this.blockName, elementName, modifiers);
  }

  /**
   * Generates a BEM modifier class name for the block
   * @param modifierName The name of the modifier
   * @returns BEM modifier class name
   */
  modifier(modifierName: string): string {
    return `${this.blockName}--${modifierName}`;
  }

  /**
   * Generates BEM class names
   * @param block Block name
   * @param element Optional element name
   * @param modifiers Optional array of modifiers
   * @returns Space-separated BEM class names
   */
  private generateClassNames(block: string, element: string | null, modifiers?: string[]): string {
    const baseClass = element ? `${block}__${element}` : block;

    if (!modifiers || modifiers.length === 0) {
      return baseClass;
    }

    // Filter out empty modifiers and generate modifier classes
    const modifierClasses = modifiers
      .filter((modifier) => !!modifier)
      .map((modifier) => `${baseClass}--${modifier}`);

    return [baseClass, ...modifierClasses].join(' ');
  }
}
