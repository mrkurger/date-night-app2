import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

';
describe('ThemeService', () => {
  let service: ThemeService;
  let localStorageSpy: jasmine.Spy;
  let matchMediaSpy: jasmine.Spy;
  let addEventListenerSpy: jasmine.Spy;

  beforeEach(() => {
    // Spy on localStorage
    localStorageSpy = spyOn(localStorage, 'getItem').and.returnValue(null)
    spyOn(localStorage, 'setItem')

    // Spy on matchMedia
    addEventListenerSpy = jasmine.createSpy('addEventListener')
    matchMediaSpy = spyOn(window, 'matchMedia').and.returnValue({
      matches: false,
      addEventListener: addEventListenerSpy,
      removeEventListener: jasmine.createSpy('removeEventListener'),
      dispatchEvent: jasmine.createSpy('dispatchEvent'),
      onchange: null,
      media: '',
      addListener: jasmine.createSpy('addListener'),
      removeListener: jasmine.createSpy('removeListener'),
    } as any)

    TestBed.configureTestingModule({})
    service = TestBed.inject(ThemeService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should initialize with system theme by default', () => {
    expect(service.getCurrentTheme()).toBe('system')
  })

  it('should initialize with saved theme from localStorage', () => {
    localStorageSpy.and.returnValue('dark')
    service = TestBed.inject(ThemeService)
    expect(service.getCurrentTheme()).toBe('dark')
  })

  it('should set theme and save to localStorage', () => {
    service.setTheme('dark')
    expect(service.getCurrentTheme()).toBe('dark')
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
  })

  it('should toggle theme correctly', () => {
    // Start with light theme
    service.setTheme('light')
    expect(service.getCurrentTheme()).toBe('light')

    // Toggle to dark
    service.toggleTheme()
    expect(service.getCurrentTheme()).toBe('dark')

    // Toggle back to light
    service.toggleTheme()
    expect(service.getCurrentTheme()).toBe('light')
  })

  it('should toggle from system theme based on current preference', () => {
    // System theme with light preference
    matchMediaSpy.and.returnValue({
      matches: false, // Light preference
      addEventListener: addEventListenerSpy,
      removeEventListener: jasmine.createSpy('removeEventListener'),
      dispatchEvent: jasmine.createSpy('dispatchEvent'),
      onchange: null,
      media: '',
      addListener: jasmine.createSpy('addListener'),
      removeListener: jasmine.createSpy('removeListener'),
    } as any)

    service = TestBed.inject(ThemeService)
    service.setTheme('system')

    // Toggle from system (light preference) should go to dark
    service.toggleTheme()
    expect(service.getCurrentTheme()).toBe('dark')
  })

  it('should detect dark mode correctly', () => {
    // Light theme
    service.setTheme('light')
    expect(service.isDarkMode()).toBeFalse()

    // Dark theme
    service.setTheme('dark')
    expect(service.isDarkMode()).toBeTrue()

    // System theme with light preference
    matchMediaSpy.and.returnValue({
      matches: false,
      addEventListener: addEventListenerSpy,
      removeEventListener: jasmine.createSpy('removeEventListener'),
      dispatchEvent: jasmine.createSpy('dispatchEvent'),
      onchange: null,
      media: '',
      addListener: jasmine.createSpy('addListener'),
      removeListener: jasmine.createSpy('removeListener'),
    } as any)

    service = TestBed.inject(ThemeService)
    service.setTheme('system')
    expect(service.isDarkMode()).toBeFalse()

    // System theme with dark preference
    matchMediaSpy.and.returnValue({
      matches: true,
      addEventListener: addEventListenerSpy,
      removeEventListener: jasmine.createSpy('removeEventListener'),
      dispatchEvent: jasmine.createSpy('dispatchEvent'),
      onchange: null,
      media: '',
      addListener: jasmine.createSpy('addListener'),
      removeListener: jasmine.createSpy('removeListener'),
    } as any)

    service = TestBed.inject(ThemeService)
    service.setTheme('system')
    expect(service.isDarkMode()).toBeTrue()
  })
})
