import { provideLocationMocks } from '@angular/common/testing';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ParticipantService } from '@/entities/api/participant.service';
import { UidDto } from '@/entities/openapi';
import { AuthService } from '@/shared/lib/auth';
import { MockAuthService } from '@/shared/testing/mocks';

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

const participantService: Partial<ParticipantService> = {
  getAuthorizedUids: jest.fn().mockReturnValue(Promise.resolve(uidDtos)),
};

let agridataStateService: Partial<AgridataStateService>;
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
        { provide: AuthService, useClass: MockAuthService },
        { provide: ParticipantService, useValue: participantService },
        provideLocationMocks(),
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
  const activUid = '1';
  agridataStateService = {
    userUids: signal(uidDtos),
    setActiveUid: jest.fn(),
    activeUid: signal(activUid),
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountOverlayComponent],
      providers: [
        { provide: AuthService, useValue: { logout: jest.fn() } },
        {
          provide: ParticipantService,
          useValue: participantService,
        },
        {
          provide: AgridataStateService,
          useValue: agridataStateService,
        },
        provideLocationMocks(),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AccountOverlayComponent);
    component = fixture.componentInstance;
  });

  it('should set selectedUid when selectUid is called', () => {
    expect(component.selectedUid()).toBeNull();
    const newUid = 'test-uid';
    component.selectUid(newUid);
    expect(agridataStateService.setActiveUid).toHaveBeenCalledWith(newUid);
  });

  it('should close overlay when handleClickOutside is called', () => {
    component.isOverlayOpen.set(true);
    component.handleClickOutside();
    expect(component.isOverlayOpen()).toBe(false);
  });

  it('should compute activeUid from selectedUid and authorizedUids', () => {
    agridataStateService.activeUid?.set(activUid);
    component.selectedUid.set('2');
    expect(component.activeUid()).toBe('2');
    component.selectedUid.set(null);
    expect(component.activeUid()).toBe(activUid);
  });

  it('should return sorted authorizedUids', () => {
    const sorted = component.sortedUids();
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
