import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ErrorDto } from '@/app/error/error-dto';
import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { mockErrorHandlerService } from '@/shared/testing/mocks/mock-error-handler-service';

import { ErrorOutletComponent } from './error-outlet.component';


const testError = {
  id: '1',
  isFrontendError: true,
  i18nTitle: { i18n: 'error.title' },
  i18nReason: { i18n: 'error.reason' },
  originalError: new Error('Test error'),
  timestamp: new Date(),
  isHandled: false,
} as ErrorDto;


describe('ErrorOutletComponent', () => {
  let fixture: ComponentFixture<ErrorOutletComponent>;
  let component: ErrorOutletComponent;
  let errorService: Partial<ErrorHandlerService>;

  beforeEach(async () => {
    errorService = mockErrorHandlerService;
    errorService.getErrorsForHandler = jest.fn().mockReturnValue(signal([testError]));

    await TestBed.configureTestingModule({
      imports: [ErrorOutletComponent],
      providers: [
        { provide: ErrorHandlerService, useValue: errorService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ErrorOutletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display errors when present', () => {
    const errorList = fixture.debugElement.query(By.css('app-error-alert-list'));
    expect(errorList).toBeTruthy();
  });

  it('should call markAllErrorsOfHandlerAsHandled when closeErrors is triggered', () => {
    component.closeErrors();
    expect(errorService.markAllErrorsOfHandlerAsHandled).toHaveBeenCalledWith('1');
  });
});

