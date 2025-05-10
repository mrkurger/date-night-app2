// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (design-system-demo.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { ToggleComponent } from '../../shared/emerald/components/toggle/toggle.component';
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
    ToggleComponent,
    SelectComponent,
  ],
  templateUrl: './design-system-demo.component.html',
  styleUrls: ['./design-system-demo.component.scss'],
})
export class DesignSystemDemoComponent {
  // Form values
  inputValue = '';
  passwordValue = '';
  checkboxValue = false; // This will now be used by emerald-toggle
  selectValue = '';

  // Added for toggles previously using [value] binding
  checkedToggleValue = true;
  disabledCheckedToggleValue = true;
  primaryToggleValue = true;
  successToggleValue = true;
  warningToggleValue = true;
  dangerToggleValue = true;
  infoToggleValue = true;

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
    console.warn(`Button clicked: ${buttonName}`, event);
  }

  /**
   * Handles input value change events.
   * @param value The new input value
   * @param inputName The name of the input that changed
   */
  onInputChange(value: string, inputName: string): void {
    console.warn(`Input changed: ${inputName}`, value);
  }

  /**
   * Handles toggle value change events.
   * @param value The new toggle value
   * @param toggleName The name of the toggle that changed
   */
  onToggleChange(value: boolean, toggleName: string): void {
    console.warn(`Toggle changed: ${toggleName}`, value);
  }

  /**
   * Handles select value change events.
   * @param value The new select value
   * @param selectName The name of the select that changed
   */
  onSelectChange(value: string | number, selectName: string): void {
    console.warn(`Select changed: ${selectName}`, value);
  }
}
