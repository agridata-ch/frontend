import { provideLocationMocks } from '@angular/common/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockAgridataStateService,
  MockAgridataStateService,
} from '@/shared/testing/mocks/mock-agridata-state-service';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';

import { AccountOverlayComponent } from './account-overlay.component';

describe('AccountOverlayComponent', () => {
  let component: AccountOverlayComponent;
  let fixture: ComponentFixture<AccountOverlayComponent>;
  let authService: MockAuthService;
  let stateService: MockAgridataStateService;
  const userDataMock = {
    name: 'John Doe',
    email: 'john@example.com',
  };

  beforeEach(async () => {
    authService = createMockAuthService();
    stateService = createMockAgridataStateService();
    await TestBed.configureTestingModule({
      imports: [AccountOverlayComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: AgridataStateService, useValue: stateService },
        provideLocationMocks(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountOverlayComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle isOverlayOpen', () => {
    expect(component.isOverlayOpen()).toBe(false);
    component.toggleOverlay();
    expect(component.isOverlayOpen()).toBe(true);
    component.toggleOverlay();
    expect(component.isOverlayOpen()).toBe(false);
  });

  it('should call AuthService.logout when logout is called', () => {
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should toggle overlay on button click', () => {
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    fixture.detectChanges();
    expect(component.isOverlayOpen()).toBe(true);

    // Click again to close
    button.nativeElement.click();
    fixture.detectChanges();
    expect(component.isOverlayOpen()).toBe(false);
  });

  it('should call logout on button click', () => {
    fixture.componentRef.setInput('userData', userDataMock);
    fixture.detectChanges();
    // Open overlay so button is visible
    component.isOverlayOpen.set(true);
    fixture.detectChanges();
    const logoutButton = fixture.debugElement.query(By.css('app-agridata-button'));
    logoutButton.triggerEventHandler('onClick', null);
    expect(authService.logout).toHaveBeenCalled();
  });
});
