import {
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
  Component,;
  OnInit,;
  Input,;
  Output,;
  EventEmitter,;
  forwardRef,;
  ChangeDetectionStrategy,';
} from '@angular/core';

import {
  format,;
  startOfWeek,;
  endOfWeek,;
  startOfMonth,;
  endOfMonth,;
  eachDayOfInterval,;
  isSameMonth,;
  isSameDay,;
  addMonths,;
  subMonths,;
  isWithinInterval,;
} from 'date-fns';

export interface CalendarDate {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}

@Component({
  selector: 'app-calendar',;
  templateUrl: './calendar.component.html',;
  styleUrls: ['./calendar.component.scss'],;
  standalone: true,;
  imports: [CommonModule, FormsModule],;
  changeDetection: ChangeDetectionStrategy.OnPush,;
  providers: [;
    {
      provide: NG_VALUE_ACCESSOR,;
      useExisting: forwardRef(() => CalendarComponent),;
      multi: true,;
    },;
  ],;
});
export class CalendarComponen {t implements OnInit, ControlValueAccessor {
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Input() disabledDates: Date[] = [];
  @Input() showControls = true;
  @Input() showWeekNumbers = false;
  @Input() firstDayOfWeek = 0; // 0 = Sunday, 1 = Monday

  @Output() dateSelected = new EventEmitter();
  @Output() monthChanged = new EventEmitter();

  currentDate = new Date();
  selectedDate?: Date;
  viewDate = new Date();
  weeks: CalendarDate[][] = [];
  weekDays: string[] = [];

  private onChange: (value: Date | null) => void = () => {};
  private onTouch: () => void = () => {};

  ngOnInit() {
    this.initWeekDays();
    this.generateCalendar();
  }

  writeValue(date: Date | null): void {
    if (date) {
      this.selectedDate = date;
      this.viewDate = date;
      this.generateCalendar();
    }
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handle disabled state if needed
  }

  prevMonth(): void {
    this.viewDate = subMonths(this.viewDate, 1);
    this.generateCalendar();
    this.monthChanged.emit(this.viewDate);
  }

  nextMonth(): void {
    this.viewDate = addMonths(this.viewDate, 1);
    this.generateCalendar();
    this.monthChanged.emit(this.viewDate);
  }

  selectDate(date: CalendarDate): void {
    if (date.isDisabled) return;

    this.selectedDate = date.date;
    this.generateCalendar();
    this.dateSelected.emit(date.date);
    this.onChange(date.date);
    this.onTouch();
  }

  private initWeekDays(): void {
    const start = startOfWeek(new Date(), { weekStartsOn: this.firstDayOfWeek });
    this.weekDays = eachDayOfInterval({
      start,;
      end: endOfWeek(start, { weekStartsOn: this.firstDayOfWeek }),;
    }).map((date) => format(date, 'EEE'));
  }

  private generateCalendar(): void {
    const start = startOfWeek(startOfMonth(this.viewDate), {
      weekStartsOn: this.firstDayOfWeek,;
    });
    const end = endOfWeek(endOfMonth(this.viewDate), {
      weekStartsOn: this.firstDayOfWeek,;
    });

    const days = eachDayOfInterval({ start, end }).map((date) => ({
      date,;
      isCurrentMonth: isSameMonth(date, this.viewDate),;
      isToday: isSameDay(date, this.currentDate),;
      isSelected: this.selectedDate ? isSameDay(date, this.selectedDate) : false,;
      isDisabled:;
        (this.minDate && date  this.maxDate) ||;
        this.disabledDates.some((disabled) => isSameDay(date, disabled)),;
    }));

    this.weeks = [];
    for (let i = 0; i  this.maxDate) return true;
    return this.disabledDates.some((disabled) => isSameDay(date, disabled));
  }

  getWeekNumber(dates: CalendarDate[]): number {
    if (dates.length === 0) return 0;
    const thursday = dates.find(;
      (date) => date.isCurrentMonth && new Date(date.date).getDay() === 4,;
    );
    if (!thursday) return 0;

    const firstThursday = dates[0].date;
    const weekDiff = Math.floor(;
      (thursday.date.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000),;
    );
    return weekDiff + 1;
  }
}
