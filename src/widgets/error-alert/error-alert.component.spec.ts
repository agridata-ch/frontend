import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorDto } from '@/app/error/error-dto';
import { I18nService } from '@/shared/i18n';
import { createMockI18nService, MockI18nService } from '@/shared/testing/mocks/mock-i18n-service';

import { ErrorAlertComponent } from './error-alert.component';

describe('ErrorAlertComponent', () => {
  let component: ErrorAlertComponent;
  let componentRef: ComponentRef<ErrorAlertComponent>;
  let fixture: ComponentFixture<ErrorAlertComponent>;
  let i18nService: MockI18nService;

  const mockError: ErrorDto = {
    i18nErrorId: { i18n: 'error.id', i18nParameter: { errorId: 'ERR-123' } },
    i18nPath: { i18n: 'error.path', i18nParameter: { path: '/api/test' } },
    i18nReason: { i18n: 'error.reason', i18nParameter: { details: 'Something went wrong' } },
    i18nTitle: { i18n: 'error.title', i18nParameter: { errorType: 'Test' } },
    id: 'test-error-123',
    isHandled: false,
    method: 'GET',
    originalError: new Error('Test error'),
    timestamp: new Date('2025-01-27T10:00:00Z'),
    url: 'http://localhost:8060/api/test',
  };

  beforeEach(async () => {
    i18nService = createMockI18nService();

    await TestBed.configureTestingModule({
      imports: [ErrorAlertComponent],
      providers: [{ provide: I18nService, useValue: i18nService }],
    })
      .overrideComponent(ErrorAlertComponent, {
        set: {
          template: '',
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ErrorAlertComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  describe('errorMessage', () => {
    it('should return an empty string when error is not set', () => {
      fixture.detectChanges();

      expect(component['errorMessage']()).toBe('');
      expect(i18nService.translate).not.toHaveBeenCalled();
    });

    it('should include only reason when optional fields are missing', () => {
      const errorWithoutDetails: ErrorDto = {
        i18nReason: { i18n: 'error.reason' },
        i18nTitle: { i18n: 'error.title' },
        id: 'test-error-456',
        isHandled: false,
        originalError: new Error('Test error'),
        timestamp: new Date('2025-01-27T10:00:00Z'),
      };

      componentRef.setInput('error', errorWithoutDetails);
      fixture.detectChanges();

      expect(component['errorMessage']()).toBe('error.reason');
      expect(i18nService.translate).toHaveBeenCalledTimes(1);
      expect(i18nService.translate).toHaveBeenCalledWith('error.reason', undefined);
    });

    it('should join reason, path and errorId with line breaks', () => {
      componentRef.setInput('error', mockError);
      fixture.detectChanges();

      expect(component['errorMessage']()).toBe('error.reason\nerror.path\nerror.id');
      expect(i18nService.translate).toHaveBeenCalledTimes(3);
      expect(i18nService.translate).toHaveBeenNthCalledWith(
        1,
        'error.reason',
        mockError.i18nReason.i18nParameter,
      );
      expect(i18nService.translate).toHaveBeenNthCalledWith(
        2,
        'error.path',
        mockError.i18nPath?.i18nParameter,
      );
      expect(i18nService.translate).toHaveBeenNthCalledWith(
        3,
        'error.id',
        mockError.i18nErrorId?.i18nParameter,
      );
    });

    it('should recompute when the error input changes', () => {
      componentRef.setInput('error', {
        ...mockError,
        i18nErrorId: undefined,
        i18nPath: undefined,
        i18nReason: { i18n: 'error.reason.first' },
      });
      fixture.detectChanges();

      expect(component['errorMessage']()).toBe('error.reason.first');

      componentRef.setInput('error', {
        ...mockError,
        i18nErrorId: undefined,
        i18nReason: { i18n: 'error.reason.second' },
      });
      fixture.detectChanges();

      expect(component['errorMessage']()).toBe('error.reason.second\nerror.path');
    });
  });
});
