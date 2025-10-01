import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { KTIDP_IMPERSONATION_QUERY_PARAM } from '@/shared/constants/constants';
import { I18nPipe } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { mockAgridataStateService } from '@/shared/testing/mocks/mock-agridata-state.service';
import { MockAuthService, mockUserData } from '@/shared/testing/mocks/mock-auth.service';

import { SupporterOverlayComponent } from './supporter-overlay.component';

describe('SupporterOverlayComponent', () => {
  let component: SupporterOverlayComponent;
  let fixture: ComponentFixture<SupporterOverlayComponent>;
  let mockAuthService: MockAuthService;
  let mockStateService: Partial<AgridataStateService>;

  beforeEach(async () => {
    mockAuthService = new MockAuthService();
    mockStateService = mockAgridataStateService('test-uid');

    await TestBed.configureTestingModule({
      imports: [SupporterOverlayComponent, I18nPipe],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AgridataStateService, useValue: mockStateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SupporterOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('userName', () => {
    it('should return empty string when no user data', () => {
      mockAuthService.userData.mockReturnValue(null);
      expect(component['userName']()).toBe('');
    });

    it('should return combined first and last name when both exist', () => {
      mockAuthService.userData.mockReturnValue({
        givenName: 'John',
        familyName: 'Doe',
      });
      expect(component['userName']()).toBe('John Doe');
    });

    it('should return only first name when last name is missing', () => {
      mockAuthService.userData.mockReturnValue({
        givenName: 'John',
        familyName: '',
      });
      expect(component['userName']()).toBe('John');
    });

    it('should return only last name when first name is missing', () => {
      mockAuthService.userData.mockReturnValue({
        givenName: '',
        familyName: 'Doe',
      });
      expect(component['userName']()).toBe('Doe');
    });

    it('should handle real user data object', () => {
      mockAuthService.userData.mockReturnValue(mockUserData);
      expect(component['userName']()).toBe('Producer 081');
    });
  });

  describe('disableSupportMode', () => {
    it('should remove the impersonation parameter from sessionStorage and close the window', () => {
      // Setup spies
      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation();
      const windowCloseSpy = jest.spyOn(window, 'close').mockImplementation();

      // Call the method
      component.disableSupportMode();

      // Assert
      expect(removeItemSpy).toHaveBeenCalledWith(KTIDP_IMPERSONATION_QUERY_PARAM);
      expect(windowCloseSpy).toHaveBeenCalled();

      // Cleanup
      removeItemSpy.mockRestore();
      windowCloseSpy.mockRestore();
    });

    it('should only remove the specific item from sessionStorage', () => {
      // Setup
      jest.spyOn(Storage.prototype, 'removeItem').mockImplementation();
      jest.spyOn(window, 'close').mockImplementation();
      jest.spyOn(Storage.prototype, 'clear').mockImplementation();

      // Call the method
      component.disableSupportMode();

      // Assert - should call removeItem but not clear
      expect(sessionStorage.removeItem).toHaveBeenCalledWith(KTIDP_IMPERSONATION_QUERY_PARAM);
      expect(sessionStorage.clear).not.toHaveBeenCalled();

      // Cleanup
      (sessionStorage.removeItem as jest.Mock).mockRestore();
      (window.close as jest.Mock).mockRestore();
      (sessionStorage.clear as jest.Mock).mockRestore();
    });
  });
});
