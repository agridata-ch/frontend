import { provideLocationMocks } from '@angular/common/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { UserService } from '@/entities/api/user.service';
import { UidDto } from '@/entities/openapi';
import { AuthService } from '@/shared/lib/auth';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';

import { AccountOverlayComponent } from './account-overlay.component';

const uidDtos: UidDto[] = [
  {
    uid: '1',
    name: 'Alpha',
  } as UidDto,
  {
    uid: '2',
    name: 'Beta',
  } as UidDto,
  {
    uid: '3',
    name: undefined, // This will test sorting with undefined names
  } as UidDto,
];

const participantService: Partial<UserService> = {
  getAuthorizedUids: jest.fn().mockReturnValue(Promise.resolve(uidDtos)),
};

describe('AccountOverlayComponent', () => {
  let component: AccountOverlayComponent;
  let fixture: ComponentFixture<AccountOverlayComponent>;
  let authService: MockAuthService;

  const userDataMock = {
    name: 'John Doe',
    email: 'john@example.com',
  };

  beforeEach(async () => {
    authService = createMockAuthService();

    await TestBed.configureTestingModule({
      imports: [AccountOverlayComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UserService, useValue: participantService },
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
