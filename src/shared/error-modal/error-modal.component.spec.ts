import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ErrorDto } from '@/app/error/error-dto';
import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { getTranslocoModule } from '@/app/transloco-testing.module';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { mockAgridataStateService } from '@/shared/testing/mocks/mock-agridata-state.service';
import { mockErrorHandlerService } from '@/shared/testing/mocks/mock-error-handler-service';
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
  let errorService: Partial<ErrorHandlerService>;
  let stateService: ReturnType<typeof mockAgridataStateService>;
  beforeEach(async () => {
    errorService = mockErrorHandlerService;
    errorService.getGlobalErrors = jest.fn().mockReturnValue(signal([testError]));
    stateService = mockAgridataStateService('test-ui');
    await TestBed.configureTestingModule({
      imports: [
        ErrorModal,
        ModalComponent,
        getTranslocoModule({
          langs: {
            de: {},
          },
        }),
      ],
      providers: [
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: AgridataStateService, useValue: stateService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ErrorModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display modal when errors exist', () => {
    const modalRef = fixture.debugElement.query(By.directive(ModalComponent));

    expect(modalRef).toBeTruthy();
  });

  it('should call markAllGlobalAsHandled when closeErrors is triggered', () => {
    component.closeErrors();
    expect(errorService.markAllGlobalAsHandled).toHaveBeenCalled();
  });
});
