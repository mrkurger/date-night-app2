import {
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { _NebularModule } from '../../nebular.module';
import { CommonModule } from '@angular/common';
  FormBuilder,;
  FormGroup,;
  ReactiveFormsModule,;
  FormArray,;
  ValidatorFn,;
  ValidationErrors,;
  AbstractControl,;
  Validators,';
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

  if (end  {
  if (!(control instanceof FormArray)) {
    return null;
  }

  const timeSlots = control.value as { startTime: string; endTime: string }[];
  const overlaps = timeSlots.some((slot1, index1) =>;
    timeSlots.some((slot2, index2) => {
      if (index1 === index2) return false;

      const start1 = timeToMinutes(slot1.startTime);
      const end1 = timeToMinutes(slot1.endTime);
      const start2 = timeToMinutes(slot2.startTime);
      const end2 = timeToMinutes(slot2.endTime);

      return start1  start2;
    }),;
  );

  return overlaps ? { overlappingSlots: true } : null;
};

@Component({
    selector: 'app-availability-calendar',;
    imports: [;
        CommonModule,;
        ReactiveFormsModule,;
        NbDatepickerModule,;
        NbFormFieldModule,;
        NbInputModule,;
        NbButtonModule,;
        NbSelectModule,;
        NbIconModule,;
    ],;
    template: `;`
    ;
      ;
        ;
        ;
          Select Date;
          ;
          ;
          ;
          ;
            Date is required;
          ;
        ;

        ;
        ;
          ;
            ;
              Start Time;
              ;
              ;
                End time must be after start time;
              ;
            ;

            ;
              End Time;
              ;
            ;

            ;
              ;
            ;
          ;

          ;
            Time slots cannot overlap;
          ;
        ;

        ;
        ;
          ;
          Add Time Slot;
        ;

        ;
        ;
          Repeat;
          ;
            One-time;
            Weekly;
          ;
        ;
      ;
    ;
  `,;`
    styles: [;
        `;`
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
      .date-picker,;
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
    `,;`
    ];
});
export class AvailabilityCalendarComponen {t implements OnInit {
  @Input() initialAvailability?: AvailabilitySlot;
  @Output() availabilityChange = new EventEmitter();

  availabilityForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.availabilityForm = this.fb.group({
      date: [null, [Validators.required]],;
      timeSlots: this.fb.array([], [validateTimeSlotOverlap]),;
      isRecurring: [false],;
    });
  }

  ngOnInit() {
    if (this.initialAvailability) {
      this.availabilityForm.patchValue({
        date: this.initialAvailability.date,;
        isRecurring: this.initialAvailability.isRecurring || false,;
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
          date: value.date,;
          timeSlots: value.timeSlots,;
          isRecurring: value.isRecurring,;
        });
      }
    });
  }

  get timeSlots(): FormArray {
    return this.availabilityForm.get('timeSlots') as FormArray;
  }

  addTimeSlot(slot?: TimeSlot) {
    const timeSlot = this.fb.group(;
      {
        startTime: [slot?.startTime || '09:00'],;
        endTime: [slot?.endTime || '17:00'],;
      },;
      { validators: validateTimeSlot },;
    );

    this.timeSlots.push(timeSlot);
  }

  removeTimeSlot(index: number) {
    if (this.timeSlots.length > 1) {
      this.timeSlots.removeAt(index);
    }
  }
}
