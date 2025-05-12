// ===================================================
// This file contains settings for component configuration (notes-dialog.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NbDialogRef,
  NbDialogModule,
  NbCardModule,
  NbButtonModule,
  NbFormFieldModule,
  NbInputModule,
} from '@nebular/theme';

export interface NotesDialogData {
  title: string;
  notes: string;
  maxLength?: number;
  placeholder?: string;
}

@Component({
  selector: 'app-notes-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NbDialogModule,
    NbCardModule,
    NbButtonModule,
    NbFormFieldModule,
    NbInputModule,
  ],
  template: `
    <nb-card>
      <nb-card-header>{{ data.title }}</nb-card-header>
      <nb-card-body>
        <nb-form-field>
          <textarea
            nbInput
            fullWidth
            [(ngModel)]="notes"
            [placeholder]="data.placeholder || 'Enter your notes here...'"
            [maxlength]="data.maxLength || 500"
            rows="5"
          ></textarea>
          <div class="text-right">{{ notes.length }} / {{ data.maxLength || 500 }}</div>
        </nb-form-field>
      </nb-card-body>
      <nb-card-footer class="dialog-footer">
        <button nbButton status="basic" (click)="onCancel()">Cancel</button>
        <button nbButton status="primary" (click)="onSave()">Save</button>
      </nb-card-footer>
    </nb-card>
  `,
  styles: [
    `
      :host {
        nb-card {
          max-width: 600px;
        }

        nb-card-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }
      }
    `,
  ],
})
export class NotesDialogComponent implements OnInit {
  notes: string = '';
  data: NotesDialogData;

  constructor(protected dialogRef: NbDialogRef<NotesDialogComponent>) {}

  ngOnInit() {
    this.data = this.dialogRef.componentRef?.instance['data'];
    this.notes = this.data?.notes || '';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.notes);
  }
}
