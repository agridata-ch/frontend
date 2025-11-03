import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { UserService } from '@/entities/api/user.service';
import { UserInfoDto } from '@/entities/openapi';
import { SupporterPageComponent } from '@/pages/supporter-page/supporter-page.component';
import { KTIDP_IMPERSONATION_QUERY_PARAM } from '@/shared/constants/constants';
import { I18nPipe } from '@/shared/i18n';
import { createMockUserService, MockUserService } from '@/shared/testing/mocks';
import {
  createMockErrorHandlerService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks/mock-error-handler.service';

describe('SupporterPageComponent', () => {
  let component: SupporterPageComponent;
  let fixture: ComponentFixture<SupporterPageComponent>;

  let userService: MockUserService;
  let errorService: MockErrorHandlerService;

  beforeEach(async () => {
    userService = createMockUserService();
    errorService = createMockErrorHandlerService();

    await TestBed.configureTestingModule({
      imports: [SupporterPageComponent, I18nPipe],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: ErrorHandlerService, useValue: errorService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SupporterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle errors from fetchProducersResource and send them to errorService', async () => {
    const testError = new Error('Test error from getProducers');
    (userService.getProducers as jest.Mock).mockRejectedValueOnce(testError);

    // Create a new fixture with the mocked error
    const errorFixture = TestBed.createComponent(SupporterPageComponent);
    errorFixture.detectChanges();
    await errorFixture.whenStable();

    expect(errorService.handleError).toHaveBeenCalledWith(testError);
  });

  describe('getName', () => {
    it('should return full name when both givenName and familyName are provided', () => {
      const user: UserInfoDto = {
        givenName: 'John',
        familyName: 'Doe',
      } as UserInfoDto;

      const result = component['getName'](user);

      expect(result).toBe('John Doe');
    });

    it('should return only givenName when familyName is missing', () => {
      const user: UserInfoDto = {
        givenName: 'John',
      } as UserInfoDto;

      const result = component['getName'](user);

      expect(result).toBe('John');
    });

    it('should return only familyName when givenName is missing', () => {
      const user: UserInfoDto = {
        familyName: 'Doe',
      } as UserInfoDto;

      const result = component['getName'](user);

      expect(result).toBe('Doe');
    });

    it('should return empty string when both names are missing', () => {
      const user: UserInfoDto = {} as UserInfoDto;

      const result = component['getName'](user);

      expect(result).toBe('');
    });
  });

  describe('getAddress', () => {
    it('should return full address when both postalCode and locality are provided', () => {
      const user: UserInfoDto = {
        addressPostalCode: '12345',
        addressLocality: 'Springfield',
      } as UserInfoDto;

      const result = component['getAddress'](user);

      expect(result).toBe('12345 Springfield');
    });

    it('should return only postalCode when locality is missing', () => {
      const user: UserInfoDto = {
        addressPostalCode: '12345',
      } as UserInfoDto;

      const result = component['getAddress'](user);

      expect(result).toBe('12345');
    });

    it('should return only locality when postalCode is missing', () => {
      const user: UserInfoDto = {
        addressLocality: 'Springfield',
      } as UserInfoDto;

      const result = component['getAddress'](user);

      expect(result).toBe('Springfield');
    });

    it('should return empty string when both address fields are missing', () => {
      const user: UserInfoDto = {} as UserInfoDto;

      const result = component['getAddress'](user);

      expect(result).toBe('');
    });
  });

  describe('openImpersonationTab', () => {
    let windowOpenSpy: jest.SpyInstance;
    let originalLocation: Location;

    beforeEach(() => {
      windowOpenSpy = jest.spyOn(globalThis, 'open').mockImplementation(() => null);
      originalLocation = globalThis.location;
      Object.defineProperty(globalThis, 'location', {
        value: {
          origin: 'https://test.example.com',
        },
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      windowOpenSpy.mockRestore();
      Object.defineProperty(globalThis, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      });
    });

    it('should open a new tab with correct impersonation URL', () => {
      const user: UserInfoDto = {
        ktIdP: 'test-user-123',
      } as UserInfoDto;

      component['openImpersonationTab'](user);

      expect(windowOpenSpy).toHaveBeenCalledWith(
        `https://test.example.com?${KTIDP_IMPERSONATION_QUERY_PARAM}=test-user-123`,
        '_blank',
      );
    });

    it('should handle different ktIdP values', () => {
      const user: UserInfoDto = {
        ktIdP: 'another-user-456',
      } as UserInfoDto;

      component['openImpersonationTab'](user);

      expect(windowOpenSpy).toHaveBeenCalledWith(
        `https://test.example.com?${KTIDP_IMPERSONATION_QUERY_PARAM}=another-user-456`,
        '_blank',
      );
    });
  });
});
