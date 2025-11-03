import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ErrorDto } from '@/app/error/error-dto';
import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import {
  createMockAgridataStateService,
  MockAgridataStateService,
} from '@/shared/testing/mocks/mock-agridata-state-service';
import {
  createMockErrorHandlerService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks/mock-error-handler.service';
import { ModalComponent } from '@/shared/ui/modal/modal.component';

import { ErrorModal } from './error-modal.component';

const testError = {
  id: '1',
  isFrontendError: true,
  i18nTitle: { i18n: 'error.title' },
  i18nReason: { i18n: 'error.reason' },
  originalError: new Error('Test error'),
  timestamp: new Date(),
  isHandled: false,
} as ErrorDto;

describe('ErrorModal', () => {
  let fixture: ComponentFixture<ErrorModal>;
  let component: ErrorModal;
  let errorService: MockErrorHandlerService;
  let stateService: MockAgridataStateService;
  beforeEach(async () => {
    errorService = createMockErrorHandlerService();
    errorService.getGlobalErrors = jest.fn().mockReturnValue(signal([testError]));
    stateService = createMockAgridataStateService();
    await TestBed.configureTestingModule({
      imports: [ErrorModal, ModalComponent],
      providers: [
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: AgridataStateService, useValue: stateService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ErrorModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display modal when errors exist', async () => {
    stateService.__testSignals.currentRouteWithoutQueryParams.set('/some-route');

    await fixture.whenStable();

    const modalRef = fixture.debugElement.query(By.directive(ModalComponent));
    expect(modalRef).toBeTruthy();
  });

  it('should call markAllGlobalAsHandled when closeErrors is triggered', () => {
    component.closeErrors();
    expect(errorService.markAllGlobalAsHandled).toHaveBeenCalled();
  });
});
