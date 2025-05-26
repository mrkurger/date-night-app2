import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SideMenuComponent } from './side-menu.component';
import { MenuItem } from 'primeng/api';

';
describe('SideMenuComponent', () => {
  let component: SideMenuComponent;
  let fixture: ComponentFixture;

  const mockMenuItems: MenuItem[] = [;
    {
      label: 'Dashboard',;
      icon: 'pi pi-home',;
      routerLink: ['/dashboard'],;
    },;
    {
      label: 'Profile',;
      icon: 'pi pi-user',;
      items: [;
        {
          label: 'Settings',;
          icon: 'pi pi-cog',;
          routerLink: ['/profile/settings'],;
        },;
        {
          label: 'Security',;
          icon: 'pi pi-lock',;
          routerLink: ['/profile/security'],;
        },;
      ],;
    },;
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, SideMenuComponent],;
    }).compileComponents();

    fixture = TestBed.createComponent(SideMenuComponent);
    component = fixture.componentInstance;
    component.menuItems = mockMenuItems;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit visibleChange when sidebar is shown/hidden', () => {
    const spy = jest.spyOn(component.visibleChange, 'emit');
    component.visible = true;
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should emit onShow when sidebar is shown', () => {
    const spy = jest.spyOn(component.onShow, 'emit');
    component.visible = true;
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit onHide when sidebar is hidden', () => {
    const spy = jest.spyOn(component.onHide, 'emit');
    component.visible = false;
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit menuItemClick when menu item is clicked', () => {
    const spy = jest.spyOn(component.menuItemClick, 'emit');
    component.onMenuItemClick({ item: mockMenuItems[0] });
    expect(spy).toHaveBeenCalledWith(mockMenuItems[0]);
  });

  it('should apply compact styles when compact is true', () => {
    component.compact = true;
    fixture.detectChanges();
    const sideMenu = fixture.nativeElement.querySelector('.side-menu');
    expect(sideMenu.classList.contains('compact')).toBeTruthy();
  });
});
