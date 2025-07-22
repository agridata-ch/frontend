import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AuthService } from '@/shared/lib/auth';

import { AccountOverlayComponent } from './account-overlay.component';

const mockAuthService: Partial<AuthService> = {
  logout: jest.fn(),
};

describe('AccountOverlayComponent', () => {
  let component: AccountOverlayComponent;
  let fixture: ComponentFixture<AccountOverlayComponent>;
  let authService: AuthService;

  const userDataMock = {
    name: 'John Doe',
    email: 'john@example.com',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountOverlayComponent],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountOverlayComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return initials from full name', () => {
    fixture.componentRef.setInput('userData', { name: 'John Doe' });
    expect(component.initials()).toBe('JD');
    fixture.componentRef.setInput('userData', { name: 'Alice' });
    expect(component.initials()).toBe('A');
    fixture.componentRef.setInput('userData', { name: '' });
    expect(component.initials()).toBe('');
    fixture.componentRef.setInput('userData', null);
    expect(component.initials()).toBe('');
    fixture.componentRef.setInput('userData', { name: '  Bob   Smith  ' });
    expect(component.initials()).toBe('BS');
  });

  it('should compute initials via computed property', () => {
    fixture.componentRef.setInput('userData', userDataMock);
    // You need to call detectChanges to update signals/computed in template
    fixture.detectChanges();
    expect(component.initials()).toBe('JD');
  });

  it('should toggle overlayOpen', () => {
    expect(component.overlayOpen()).toBe(false);
    component.toggleOverlay();
    expect(component.overlayOpen()).toBe(true);
    component.toggleOverlay();
    expect(component.overlayOpen()).toBe(false);
  });

  it('should call AuthService.logout when logout is called', () => {
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should toggle overlay on button click', () => {
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    fixture.detectChanges();
    expect(component.overlayOpen()).toBe(true);

    // Click again to close
    button.nativeElement.click();
    fixture.detectChanges();
    expect(component.overlayOpen()).toBe(false);
  });

  it('should call logout on button click', () => {
    fixture.componentRef.setInput('userData', userDataMock);
    fixture.detectChanges();
    // Open overlay so button is visible
    component.overlayOpen.set(true);
    fixture.detectChanges();
    const logoutButton = fixture.debugElement.query(By.css('app-agridata-button'));
    logoutButton.triggerEventHandler('onClick', null);
    expect(authService.logout).toHaveBeenCalled();
  });
});
