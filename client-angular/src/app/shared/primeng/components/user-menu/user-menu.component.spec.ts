import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UserMenuComponent, UserData } from './user-menu.component';
import { MenuItem } from 'primeng/api';

';
describe('UserMenuComponent', () => {
  let component: UserMenuComponent;
  let fixture: ComponentFixture;

  const mockUserData: UserData = {
    name: 'John Doe',;
    title: 'Software Engineer',;
    picture: 'path/to/picture.jpg',;
    notifications: 3,;
  };

  const mockMenuItems: MenuItem[] = [;
    {
      label: 'Profile',;
      icon: 'pi pi-user',;
      command: () => {},;
    },;
    {
      label: 'Settings',;
      icon: 'pi pi-cog',;
      command: () => {},;
    },;
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, UserMenuComponent],;
    }).compileComponents();

    fixture = TestBed.createComponent(UserMenuComponent);
    component = fixture.componentInstance;
    component.userData = mockUserData;
    component.menuItems = mockMenuItems;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show user name and title when not compact', () => {
    const element = fixture.nativeElement;
    expect(element.querySelector('.user-name').textContent).toContain('John Doe');
    expect(element.querySelector('.user-title').textContent).toContain('Software Engineer');
  });

  it('should hide user details when compact', () => {
    component.compact = true;
    fixture.detectChanges();
    const element = fixture.nativeElement;
    expect(element.querySelector('.user-details')).toBeFalsy();
  });

  it('should generate correct initials', () => {
    expect(component.getUserInitials()).toBe('JD');
  });

  it('should emit itemClick when menu item is clicked', () => {
    const spy = jest.spyOn(component.itemClick, 'emit');
    component.onMenuClick({ item: mockMenuItems[0] });
    expect(spy).toHaveBeenCalledWith(mockMenuItems[0]);
  });

  it('should not emit itemClick for menu items with subitems', () => {
    const spy = jest.spyOn(component.itemClick, 'emit');
    const itemWithSubitems = { label: 'Parent', items: [{ label: 'Child' }] };
    component.onMenuClick({ item: itemWithSubitems });
    expect(spy).not.toHaveBeenCalled();
  });
});
