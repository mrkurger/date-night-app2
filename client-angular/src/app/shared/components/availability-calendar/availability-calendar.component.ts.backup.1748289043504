import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { _NebularModule } from '../../nebular.module';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormArray,
  ValidatorFn,
  ValidationErrors,
  AbstractControl,
  Validators,
} from '@angular/forms';

export interface TimeSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface AvailabilitySlot {
  date?: Date;
  timeSlots: TimeSlot[];
  isRecurring?: boolean;
}

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const validateTimeSlot: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const startTime = control.get('startTime')?.value;
  const endTime = control.get('endTime')?.value;

  if (!startTime || !endTime) {
    return null;
  }

  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  if (end <= start) {
    return { invalidTimeRange: true };
  }

  return null;
};

const validateTimeSlotOverlap: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  if (!(control instanceof FormArray)) {
    return null;
  }

  const timeSlots = control.value as { startTime: string; endTime: string }[];
  const overlaps = timeSlots.some((slot1, index1) =>
    timeSlots.some((slot2, index2) => {
      if (index1 === index2) return false;

      const start1 = timeToMinutes(slot1.startTime);
      const end1 = timeToMinutes(slot1.endTime);
      const start2 = timeToMinutes(slot2.startTime);
      const end2 = timeToMinutes(slot2.endTime);

      return start1 < end2 && end1 > start2;
    }),
  );

  return overlaps ? { overlappingSlots: true } : null;
};

@Component({
    selector: 'app-availability-calendar',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        NbDatepickerModule,
        NbFormFieldModule,
        NbInputModule,
        NbButtonModule,
        NbSelectModule,
        NbIconModule,
    ],
    template: `
    <div class="availability-calendar">
      <form [formGroup]="availabilityForm">
        <!-- Date Selection -->
        <mat-form-field appearance="outline" class="date-picker">
          <mat-label>Select Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="date" />
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error *ngIf="availabilityForm.get('date')?.errors?.required">
            Date is required
          </mat-error>
        </mat-form-field>

        <!-- Time Slots -->
        <div formArrayName="timeSlots" class="time-slots">
          <div
            *ngFor="let slot of timeSlots.controls; let i = index"
            [formGroupName]="i"
            class="time-slot"
          >
            <mat-form-field appearance="outline">
              <mat-label>Start Time</mat-label>
              <input matInput type="time" formControlName="startTime" />
              <mat-error *ngIf="slot.errors?.invalidTimeRange">
                End time must be after start time
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>End Time</mat-label>
              <input matInput type="time" formControlName="endTime" />
            </mat-form-field>

            <button
              mat-icon-button
              color="warn"
              (click)="removeTimeSlot(i)"
              type="button"
              [disabled]="timeSlots.length === 1"
            >
              <nb-icon icon="delete"></nb-icon>
            </button>
          </div>

          <div class="error-message" *ngIf="timeSlots.errors?.overlappingSlots">
            Time slots cannot overlap
          </div>
        </div>

        <!-- Add Time Slot Button -->
        <button mat-button color="primary" (click)="addTimeSlot()" type="button">
          <nb-icon icon="add"></nb-icon>
          Add Time Slot
        </button>

        <!-- Recurring Option -->
        <mat-form-field appearance="outline" class="recurring-select">
          <mat-label>Repeat</mat-label>
          <mat-select formControlName="isRecurring">
            <mat-option [value]="false">One-time</mat-option>
            <mat-option [value]="true">Weekly</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </div>
  `,
    styles: [
        `
      .availability-calendar {
        padding: 1rem;
      }
      .time-slots {
        margin: 1rem 0;
      }
      .time-slot {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-bottom: 0.5rem;
      }
      .date-picker,
      .recurring-select {
        width: 100%;
        max-width: 300px;
      }
      .error-message {
        color: #f44336;
        font-size: 12px;
        margin-top: -8px;
        margin-bottom: 8px;
      }
    `,
    ]
})
export class AvailabilityCalendarComponent implements OnInit {
  @Input() initialAvailability?: AvailabilitySlot;
  @Output() availabilityChange = new EventEmitter<AvailabilitySlot>();

  availabilityForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.availabilityForm = this.fb.group({
      date: [null, [Validators.required]],
      timeSlots: this.fb.array([], [validateTimeSlotOverlap]),
      isRecurring: [false],
    });
  }

  ngOnInit() {
    if (this.initialAvailability) {
      this.availabilityForm.patchValue({
        date: this.initialAvailability.date,
        isRecurring: this.initialAvailability.isRecurring || false,
      });

      // Initialize time slots
      this.initialAvailability.timeSlots.forEach((slot) => {
        this.addTimeSlot(slot);
      });
    } else {
      // Add one empty time slot by default
      this.addTimeSlot();
    }

    // Subscribe to form changes
    this.availabilityForm.valueChanges.subscribe((value) => {
      if (this.availabilityForm.valid) {
        this.availabilityChange.emit({
          date: value.date,
          timeSlots: value.timeSlots,
          isRecurring: value.isRecurring,
        });
      }
    });
  }

  get timeSlots(): FormArray {
    return this.availabilityForm.get('timeSlots') as FormArray;
  }

  addTimeSlot(slot?: TimeSlot) {
    const timeSlot = this.fb.group(
      {
        startTime: [slot?.startTime || '09:00'],
        endTime: [slot?.endTime || '17:00'],
      },
      { validators: validateTimeSlot },
    );

    this.timeSlots.push(timeSlot);
  }

  removeTimeSlot(index: number) {
    if (this.timeSlots.length > 1) {
      this.timeSlots.removeAt(index);
    }
  }
}
