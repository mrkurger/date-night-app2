import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from './theme-toggle.component';
import { ThemeService } from '../../../core/services/theme.service';
import { of } from 'rxjs';

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let themeServiceMock: jasmine.SpyObj<ThemeService>;

  beforeEach(async () => {
    // Create mock service
    themeServiceMock = jasmine.createSpyObj('ThemeService', ['toggleTheme'], {
      isDarkMode$: of(false),
    });

    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
      providers: [{ provide: ThemeService, useValue: themeServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display icon-only mode by default', () => {
    const button = fixture.nativeElement.querySelector('.theme-toggle');
    expect(button).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.theme-toggle-with-label')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.theme-toggle-switch')).toBeFalsy();
  });

  it('should display with-label mode when specified', () => {
    component.mode = 'with-label';
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.theme-toggle-with-label');
    expect(button).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.theme-toggle')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.theme-toggle-switch')).toBeFalsy();
  });

  it('should display toggle mode when specified', () => {
    component.mode = 'toggle';
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.theme-toggle-switch');
    expect(button).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.theme-toggle')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.theme-toggle-with-label')).toBeFalsy();
  });

  it('should call toggleTheme when clicked', () => {
    const button = fixture.nativeElement.querySelector('.theme-toggle');
    button.click();

    expect(themeServiceMock.toggleTheme).toHaveBeenCalled();
  });

  it('should update icon based on theme', () => {
    // Initial state (light theme)
    let icon = fixture.nativeElement.querySelector('.theme-toggle i');
    expect(icon.classList.contains('fa-moon')).toBeTrue();

    // Update to dark theme
    (themeServiceMock.isDarkMode$ as any).next(true);
    fixture.detectChanges();

    icon = fixture.nativeElement.querySelector('.theme-toggle i');
    expect(icon.classList.contains('fa-sun')).toBeTrue();
  });

  it('should position label correctly', () => {
    component.mode = 'with-label';
    component.labelPosition = 'left';
    fixture.detectChanges();

    let button = fixture.nativeElement.querySelector('.theme-toggle-with-label');
    expect(button.classList.contains('theme-toggle-with-label--label-left')).toBeTrue();

    component.labelPosition = 'right';
    fixture.detectChanges();

    button = fixture.nativeElement.querySelector('.theme-toggle-with-label');
    expect(button.classList.contains('theme-toggle-with-label--label-right')).toBeTrue();
  });

  it('should use custom label when provided', () => {
    component.mode = 'with-label';
    component.label = 'Custom Label';
    component.labelPosition = 'left';
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.theme-toggle-with-label__label');
    expect(label.textContent).toContain('Custom Label');
  });
});
