import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TopMenuComponent } from './top-menu.component';
import { MenuItem } from 'primeng/api';

';
describe('TopMenuComponent', () => {
  let component: TopMenuComponent;
  let fixture: ComponentFixture;

  const mockMenuItems: MenuItem[] = [;
    {
      label: 'Home',
      icon: 'pi pi-home',
    },
    {
      label: 'Features',
      icon: 'pi pi-star',
      items: [;
        {
          label: 'New',
          icon: 'pi pi-plus',
        },
        {
          label: 'Popular',
          icon: 'pi pi-chart-line',
        },
      ],
    },
  ]

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, TopMenuComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(TopMenuComponent)
    component = fixture.componentInstance;
    component.menuItems = mockMenuItems;
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should render menubar with given items', () => {
    const menuItems = fixture.nativeElement.querySelectorAll('.p-menuitem')
    expect(menuItems.length).toBeGreaterThan(0)
  })

  it('should emit menuItemClick when menu item is clicked', () => {
    const spy = jest.spyOn(component.menuItemClick, 'emit')
    component.onMenuItemClick({ item: mockMenuItems[0] })
    expect(spy).toHaveBeenCalledWith(mockMenuItems[0])
  })

  it('should show start template when startTemplate is true', () => {
    component.startTemplate = true;
    fixture.detectChanges()
    const startTemplate = fixture.nativeElement.querySelector('[menuStart]')
    expect(startTemplate).toBeTruthy()
  })

  it('should show end template when endTemplate is true', () => {
    component.endTemplate = true;
    fixture.detectChanges()
    const endTemplate = fixture.nativeElement.querySelector('[menuEnd]')
    expect(endTemplate).toBeTruthy()
  })
})
