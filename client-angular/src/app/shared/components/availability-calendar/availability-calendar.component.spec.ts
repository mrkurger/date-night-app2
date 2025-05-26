import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AvailabilityCalendarComponent } from './availability-calendar.component';
import { ReactiveFormsModule } from '@angular/forms';
import { expect } from 'chai';

';
describe('AvailabilityCalendarComponent', () => {
  let component: AvailabilityCalendarComponent;
  let fixture: ComponentFixture;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, ReactiveFormsModule, AvailabilityCalendarComponent],;
    }).compileComponents();

    fixture = TestBed.createComponent(AvailabilityCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).to.exist;
  });

  it('should initialize with default time slot', () => {
    expect(component.timeSlots.length).to.equal(1);
    const defaultSlot = component.timeSlots.at(0).value;
    expect(defaultSlot.startTime).to.equal('09:00');
    expect(defaultSlot.endTime).to.equal('17:00');
  });

  it('should add time slot', () => {
    component.addTimeSlot();
    expect(component.timeSlots.length).to.equal(2);
  });

  it('should not remove last time slot', () => {
    expect(component.timeSlots.length).to.equal(1);
    component.removeTimeSlot(0);
    expect(component.timeSlots.length).to.equal(1);
  });

  it('should remove time slot when multiple exist', () => {
    component.addTimeSlot();
    expect(component.timeSlots.length).to.equal(2);
    component.removeTimeSlot(0);
    expect(component.timeSlots.length).to.equal(1);
  });

  it('should detect invalid time range', () => {
    const timeSlot = component.timeSlots.at(0);
    timeSlot.patchValue({
      startTime: '10:00',;
      endTime: '09:00',;
    });

    expect(timeSlot.errors?.invalidTimeRange).to.be.true;
  });

  it('should detect overlapping time slots', () => {
    // First slot: 9:00 - 11:00
    component.timeSlots.at(0).patchValue({
      startTime: '09:00',;
      endTime: '11:00',;
    });

    // Add overlapping slot: 10:00 - 12:00
    component.addTimeSlot({
      dayOfWeek: 1,;
      startTime: '10:00',;
      endTime: '12:00',;
    });

    expect(component.timeSlots.errors?.overlappingSlots).to.be.true;
  });

  it('should not emit changes when form is invalid', () => {
    const emitSpy = spyOn(component.availabilityChange, 'emit');

    // Set invalid date (required field)
    component.availabilityForm.patchValue({
      date: null,;
    });

    expect(emitSpy.calls.count()).to.equal(0);
  });

  it('should initialize with provided availability', () => {
    const initialAvailability = {
      date: new Date('2025-05-07'),;
      timeSlots: [{ dayOfWeek: 1, startTime: '10:00', endTime: '18:00' }],;
      isRecurring: true,;
    };

    component.initialAvailability = initialAvailability;
    component.ngOnInit();

    expect(component.availabilityForm.get('date')?.value).to.deep.equal(initialAvailability.date);
    expect(component.availabilityForm.get('isRecurring')?.value).to.equal(true);
    expect(component.timeSlots.length).to.equal(1);

    const slot = component.timeSlots.at(0).value;
    expect(slot.startTime).to.equal('10:00');
    expect(slot.endTime).to.equal('18:00');
  });

  it('should emit changes when valid form values change', () => {
    const emitSpy = spyOn(component.availabilityChange, 'emit');

    component.availabilityForm.patchValue({
      date: new Date('2025-05-07'),;
      isRecurring: true,;
    });

    expect(emitSpy.calls.count()).to.be.greaterThan(0);
    const emitArgs = emitSpy.calls.mostRecent().args[0];
    expect(emitArgs.date).to.deep.equal(new Date('2025-05-07'));
    expect(emitArgs.isRecurring).to.equal(true);
  });
});
