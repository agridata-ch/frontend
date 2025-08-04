import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ParticipantService } from '@/entities/api/participant.service';
import { AuthService } from '@/shared/lib/auth';
import { MockResources } from '@/shared/testing/mocks/mock-resources';

import { AccountOverlayComponent } from './account-overlay.component';

const mockAuthService: Partial<AuthService> = {
  logout: jest.fn(),
};
const mockParticipantService: Partial<ParticipantService> = {
  getAuthorizedUids: MockResources.createMockResourceRef([
    {
      uid: '1',
      name: 'Alpha',
    },
    {
      uid: '2',
      name: 'Beta',
    },
    {
      uid: '3',
      name: undefined, // This will test sorting with undefined names
    },
  ]),
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
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ParticipantService, useValue: mockParticipantService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountOverlayComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
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

// Additional tests for missing coverage
describe('AccountOverlayComponent - Additional', () => {
  let component: AccountOverlayComponent;
  let fixture: ComponentFixture<AccountOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountOverlayComponent],
      providers: [
        { provide: AuthService, useValue: { logout: jest.fn() } },
        {
          provide: ParticipantService,
          useValue: mockParticipantService, // Use the mock defined above
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AccountOverlayComponent);
    component = fixture.componentInstance;
  });

  it('should set selectedUid when selectUid is called', () => {
    expect(component.selectedUid()).toBeNull();
    component.selectUid('test-uid');
    expect(component.selectedUid()).toBe('test-uid');
  });

  it('should close overlay when handleClickOutside is called', () => {
    component.isOverlayOpen.set(true);
    component.handleClickOutside();
    expect(component.isOverlayOpen()).toBe(false);
  });

  it('should compute activeUid from selectedUid and authorizedUids', () => {
    component.selectedUid.set('2');
    expect(component.activeUid()).toBe('2');
    component.selectedUid.set(null);
    expect(component.activeUid()).toBe('1');
  });

  it('should return sorted authorizedUids', () => {
    const sorted = component.authorizedUids();
    expect(sorted[0].name).toBe('Alpha');
    expect(sorted[1].name).toBe('Beta');
    expect(sorted[2].name).toBeUndefined();
  });

  it('should sort alphabetically with undefined names at the end', () => {
    const sort = component.sortAlphabetically.bind(component);
    expect(sort({ name: 'B' }, { name: 'A' })).toBeGreaterThan(0);
    expect(sort({ name: 'A' }, { name: 'B' })).toBeLessThan(0);
    expect(sort({ name: undefined }, { name: 'A' })).toBe(1);
    expect(sort({ name: 'A' }, { name: undefined })).toBe(-1);
  });
});
