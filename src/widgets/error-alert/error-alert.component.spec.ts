import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ErrorDto } from '@/app/error/error-dto';
import { AgridataDatePipe } from '@/shared/date/agridata-date.pipe';
import { I18nDirective } from '@/shared/i18n';
import { AlertComponent } from '@/widgets/alert';

import { ErrorAlertComponent } from './error-alert.component';

describe('ErrorAlertComponent', () => {
  let component: ErrorAlertComponent;
  let fixture: ComponentFixture<ErrorAlertComponent>;
  let componentRef: any;

  const mockError: ErrorDto = {
    id: 'test-error-123',
    isFrontendError: true,
    i18nTitle: { i18n: 'error.title', i18nParameter: { errorType: 'Test' } },
    i18nReason: { i18n: 'error.reason', i18nParameter: { details: 'Something went wrong' } },
    i18nPath: { i18n: 'error.path', i18nParameter: { path: '/api/test' } },
    i18nErrorId: { i18n: 'error.id', i18nParameter: { errorId: 'ERR-123' } },
    originalError: new Error('Test error'),
    timestamp: new Date('2025-01-27T10:00:00Z'),
    isHandled: false,
    url: 'http://localhost:8060/api/test',
    method: 'GET',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorAlertComponent, AlertComponent, I18nDirective, AgridataDatePipe],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorAlertComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  describe('Component Creation', () => {
    it('should create component successfully', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with no error by default', () => {
      expect(component.error()).toBeUndefined();
    });
  });

  describe('Error Display Logic', () => {
    it('should not render alert when no error is provided', () => {
      fixture.detectChanges();

      const alertElement = fixture.debugElement.query(By.directive(AlertComponent));
      expect(alertElement).toBeNull();
    });

    it('should render alert when error is provided', () => {
      componentRef.setInput('error', mockError);
      fixture.detectChanges();

      const alertElement = fixture.debugElement.query(By.directive(AlertComponent));
      expect(alertElement).toBeTruthy();
    });

    it('should configure alert component with correct properties', () => {
      componentRef.setInput('error', mockError);
      fixture.detectChanges();

      const alertComponent = fixture.debugElement.query(By.directive(AlertComponent));
      const alertInstance = alertComponent.componentInstance;

      expect(alertInstance.type()).toBe(component['AlertType'].WARNING);
      expect(alertInstance.showCloseButton()).toBe(true);
    });
  });

  describe('Error Content Display', () => {
    beforeEach(() => {
      componentRef.setInput('error', mockError);
      fixture.detectChanges();
    });

    it('should display error title with proper styling', () => {
      const titleElement = fixture.debugElement.query(By.css('.font-medium'));
      expect(titleElement).toBeTruthy();
    });

    it('should display error timestamp with proper formatting', () => {
      const timestampElement = fixture.debugElement.query(By.css('.text-xs'));
      expect(timestampElement).toBeTruthy();
    });

    it('should display error reason in main content area', () => {
      const reasonContainer = fixture.debugElement.query(
        By.css('.flex.justify-between.items-center'),
      );
      expect(reasonContainer).toBeTruthy();
    });

    it('should display details section when path and errorId are provided', () => {
      const detailsSection = fixture.debugElement.query(By.css('.mt-4'));
      expect(detailsSection).toBeTruthy();
    });
  });

  describe('Conditional Details Display', () => {
    it('should not display details section when path and errorId are missing', () => {
      const errorWithoutDetails: ErrorDto = {
        id: 'test-error-456',
        isFrontendError: true,
        i18nTitle: { i18n: 'error.title' },
        i18nReason: { i18n: 'error.reason' },
        originalError: new Error('Test error'),
        timestamp: new Date('2025-01-27T10:00:00Z'),
        isHandled: false,
      };

      componentRef.setInput('error', errorWithoutDetails);
      fixture.detectChanges();

      const detailsSection = fixture.debugElement.query(By.css('.mt-4'));
      expect(detailsSection).toBeNull();
    });

    it('should display details section with only path when errorId is missing', () => {
      const errorWithPath: ErrorDto = {
        ...mockError,
        i18nErrorId: undefined,
      };

      componentRef.setInput('error', errorWithPath);
      fixture.detectChanges();

      const detailsSection = fixture.debugElement.query(By.css('.mt-4'));
      expect(detailsSection).toBeTruthy();
    });

    it('should display details section with only errorId when path is missing', () => {
      const errorWithErrorId: ErrorDto = {
        ...mockError,
        i18nPath: undefined,
      };

      componentRef.setInput('error', errorWithErrorId);
      fixture.detectChanges();

      const detailsSection = fixture.debugElement.query(By.css('.mt-4'));
      expect(detailsSection).toBeTruthy();
    });
  });

  describe('Close Functionality', () => {
    it('should emit closeError when alert close button is clicked', () => {
      const closeErrorSpy = jest.fn();
      component.closeError.subscribe(closeErrorSpy);

      componentRef.setInput('error', mockError);
      fixture.detectChanges();

      const alertComponent = fixture.debugElement.query(By.directive(AlertComponent));
      alertComponent.triggerEventHandler('closeAlert', null);

      expect(closeErrorSpy).toHaveBeenCalledWith(true);
    });

    it('should emit closeError only once per click', () => {
      const closeErrorSpy = jest.fn();
      component.closeError.subscribe(closeErrorSpy);

      componentRef.setInput('error', mockError);
      fixture.detectChanges();

      const alertComponent = fixture.debugElement.query(By.directive(AlertComponent));
      alertComponent.triggerEventHandler('closeAlert', null);
      alertComponent.triggerEventHandler('closeAlert', null);

      expect(closeErrorSpy).toHaveBeenCalledTimes(2);
      expect(closeErrorSpy).toHaveBeenCalledWith(true);
    });
  });

  describe('Dynamic Error Updates', () => {
    it('should update display when error input changes', () => {
      const initialError: ErrorDto = {
        ...mockError,
        id: 'initial-error',
        i18nTitle: { i18n: 'initial.title' },
      };
      const updatedError: ErrorDto = {
        ...mockError,
        id: 'updated-error',
        i18nTitle: { i18n: 'updated.title' },
      };

      componentRef.setInput('error', initialError);
      fixture.detectChanges();
      expect(component.error()).toEqual(initialError);

      componentRef.setInput('error', updatedError);
      fixture.detectChanges();
      expect(component.error()).toEqual(updatedError);
    });

    it('should handle transition from error to no error', () => {
      componentRef.setInput('error', mockError);
      fixture.detectChanges();

      let alertElement = fixture.debugElement.query(By.directive(AlertComponent));
      expect(alertElement).toBeTruthy();

      componentRef.setInput('error', undefined);
      fixture.detectChanges();

      alertElement = fixture.debugElement.query(By.directive(AlertComponent));
      expect(alertElement).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle error with minimal required fields', () => {
      const minimalError: ErrorDto = {
        id: 'minimal-error',
        isFrontendError: false,
        i18nTitle: { i18n: 'minimal.title' },
        i18nReason: { i18n: 'minimal.reason' },
        originalError: new Error('Minimal error'),
        timestamp: new Date('2025-01-27T12:00:00Z'),
        isHandled: false,
      };

      componentRef.setInput('error', minimalError);
      fixture.detectChanges();

      const alertElement = fixture.debugElement.query(By.directive(AlertComponent));
      expect(alertElement).toBeTruthy();

      const detailsSection = fixture.debugElement.query(By.css('.mt-4'));
      expect(detailsSection).toBeNull();
    });

    it('should handle error with empty i18nParameter objects', () => {
      const errorWithEmptyParams: ErrorDto = {
        ...mockError,
        i18nTitle: { i18n: 'error.title', i18nParameter: {} },
        i18nReason: { i18n: 'error.reason', i18nParameter: {} },
      };

      componentRef.setInput('error', errorWithEmptyParams);
      fixture.detectChanges();

      const alertElement = fixture.debugElement.query(By.directive(AlertComponent));
      expect(alertElement).toBeTruthy();
    });

    it('should handle error without i18nParameter properties', () => {
      const errorWithoutParams: ErrorDto = {
        ...mockError,
        i18nTitle: { i18n: 'error.title' },
        i18nReason: { i18n: 'error.reason' },
        i18nPath: { i18n: 'error.path' },
        i18nErrorId: { i18n: 'error.id' },
      };

      componentRef.setInput('error', errorWithoutParams);
      fixture.detectChanges();

      const alertElement = fixture.debugElement.query(By.directive(AlertComponent));
      expect(alertElement).toBeTruthy();
    });
  });
});
