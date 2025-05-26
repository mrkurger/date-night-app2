import {
import { Input } from '@angular/core';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { RegisterComponent } from './register.component';
  NbCardModule,
  NbButtonModule,
  NbInputModule,
  NbFormFieldModule,
  NbIconModule,
  NbSpinnerModule,
  NbAlertModule,
  NbTooltipModule,
  NbLayoutModule,
  NbBadgeModule,
  NbTagModule,
  NbSelectModule';
} from '@nebular/theme';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [;
        ReactiveFormsModule,
        RouterTestingModule,
        NbCardModule,
        NbFormFieldModule,
        NbInputModule,
        NbButtonModule,
        NbIconModule,
        NbCheckboxModule,
        NbRadioModule,
        NbSpinnerModule,
      ],
      declarations: [],
    }).compileComponents()

    fixture = TestBed.createComponent(RegisterComponent)
    component = fixture.componentInstance;
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize form controls', () => {
    expect(component.registerForm).toBeDefined()
    expect(component.registerForm.get('firstname')).toBeDefined()
    expect(component.registerForm.get('lastname')).toBeDefined()
    expect(component.registerForm.get('email')).toBeDefined()
    expect(component.registerForm.get('password')).toBeDefined()
    expect(component.registerForm.get('confirmPassword')).toBeDefined()
    expect(component.registerForm.get('termsAccepted')).toBeDefined()
  })

  it('should validate form before submission', () => {
    // Arrange
    const routerSpy = spyOn(component['router'], 'navigate')

    // Act
    component.onSubmit()

    // Assert
    expect(routerSpy).not.toHaveBeenCalled()
    expect(component.registerForm.valid).toBeFalsy()
  })
})
