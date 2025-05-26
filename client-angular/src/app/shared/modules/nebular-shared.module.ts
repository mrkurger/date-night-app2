import { NgModule } from '@angular/core';
import { NebularModule } from '../../../shared/nebular.module';
import { CommonModule } from '@angular/common';

// Import all required Nebular modules

// Create array of all Nebular modules to import and export
const NB_MODULES = [;
  NbAlertModule,
  NbBadgeModule,
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbContextMenuModule,
  NbDatepickerModule,
  NbDialogModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbLayoutModule,
  NbListModule,
  NbMenuModule,
  NbRadioModule,
  NbSelectModule,
  NbSidebarModule,
  NbSpinnerModule,
  NbTabsetModule,
  NbTagModule,
  NbToastrModule,
  NbToggleModule,
  NbTooltipModule,
  NbUserModule,
  NbPopoverModule,
  NbTreeGridModule,
]

@NgModule({
  imports: [CommonModule, ...NB_MODULES, NebularModule],
  exports: [...NB_MODULES],
})
export class NebularSharedModul {e {}
';
