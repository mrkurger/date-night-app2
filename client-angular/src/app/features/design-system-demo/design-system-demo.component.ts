import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { CheckboxComponent } from '../../shared/components/checkbox/checkbox.component';
import { SelectComponent, SelectOption } from '../../shared/components/select/select.component';

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
    ButtonComponent,
    CardComponent,
    IconComponent,
    InputComponent,
    CheckboxComponent,
    SelectComponent,
  ],
  templateUrl: './design-system-demo.component.html',
  styleUrls: ['./design-system-demo.component.scss'],
})
export class DesignSystemDemoComponent {
  // Form values
  inputValue = '';
  passwordValue = '';
  checkboxValue = false;
  selectValue = '';

  // Select options
  selectOptions: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4', disabled: true },
  ];

  /**
   * Handles button click events.
   * @param event The mouse event
   * @param buttonName The name of the button that was clicked
   */
  onButtonClick(event: MouseEvent, buttonName: string): void {
    console.log(`Button clicked: ${buttonName}`, event);
  }

  /**
   * Handles input value change events.
   * @param value The new input value
   * @param inputName The name of the input that changed
   */
  onInputChange(value: string, inputName: string): void {
    console.log(`Input changed: ${inputName}`, value);
  }

  /**
   * Handles checkbox value change events.
   * @param value The new checkbox value
   * @param checkboxName The name of the checkbox that changed
   */
  onCheckboxChange(value: boolean, checkboxName: string): void {
    console.log(`Checkbox changed: ${checkboxName}`, value);
  }

  /**
   * Handles select value change events.
   * @param value The new select value
   * @param selectName The name of the select that changed
   */
  onSelectChange(value: string | number, selectName: string): void {
    console.log(`Select changed: ${selectName}`, value);
  }
}
