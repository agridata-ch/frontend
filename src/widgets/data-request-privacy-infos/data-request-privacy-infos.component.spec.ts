import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ContractRevisionService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ACTING_ROLES } from '@/shared/constants/constants';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import {
  createMockAgridataStateService,
  createMockContractRevisionService,
  createMockErrorHandlerService,
  MockAgridataStateService,
  MockContractRevisionService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { AlertComponent } from '@/shared/ui/alert';
import { ButtonComponent } from '@/shared/ui/button';

import { DataRequestPrivacyInfosComponent } from './data-request-privacy-infos.component';

describe('DataRequestPrivacyInfosComponent', () => {
  let component: DataRequestPrivacyInfosComponent;
  let componentRef: ComponentRef<DataRequestPrivacyInfosComponent>;
  let fixture: ComponentFixture<DataRequestPrivacyInfosComponent>;
  let contractRevisionService: MockContractRevisionService;
  let errorHandlerService: MockErrorHandlerService;
  let stateService: MockAgridataStateService;

  const CONTRACT_REVISION_ID = 'cr-1';
  const flushPromises = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

  beforeEach(async () => {
    contractRevisionService = createMockContractRevisionService();
    errorHandlerService = createMockErrorHandlerService();
    stateService = createMockAgridataStateService();

    await TestBed.configureTestingModule({
      imports: [
        DataRequestPrivacyInfosComponent,
        createTranslocoTestingModule({
          langs: {
            de: {
              'data-request.privacy.title': 'Datenschutz',
              'data-request.privacy.description':
                'Zwischen {{ provider }} und {{ consumer }} besteht ein **Vertrag**.',
              'data-request.privacy.foreignConsumerAlert.title': 'Sitz im Ausland',
              'data-request.privacy.foreignConsumerAlert.message':
                'Der Empfänger hat seinen Sitz im Ausland ({{ city }}, {{ country }}).',
            },
          },
        }),
      ],
      providers: [
        { provide: AgridataStateService, useValue: stateService },
        { provide: ContractRevisionService, useValue: contractRevisionService },
        { provide: ErrorHandlerService, useValue: errorHandlerService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestPrivacyInfosComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should interpolate the consumer and the provider into the description', () => {
    componentRef.setInput('consumerName', 'Agrar AG');
    componentRef.setInput('providerName', 'Identitas AG');
    fixture.detectChanges();

    const text = fixture.debugElement.nativeElement.textContent;
    expect(text).toContain('Identitas AG');
    expect(text).toContain('Agrar AG');
  });

  it('should render the formatted parts of the description as markup', () => {
    const strong = fixture.debugElement.nativeElement.querySelector('strong');
    expect(strong?.textContent).toBe('Vertrag');
  });

  it('should not turn markdown in a consumer name into a link', () => {
    componentRef.setInput('consumerName', 'Agrar [Widerruf](https://evil.example)');
    componentRef.setInput('providerName', 'Identitas AG');
    fixture.detectChanges();

    const element = fixture.debugElement.nativeElement;
    expect(element.querySelector('a')).toBeNull();
    expect(element.textContent).toContain('Agrar Widerruf');
  });

  describe('foreign consumer alert', () => {
    it('should not render when no country is set', () => {
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.directive(AlertComponent))).toBeNull();
    });

    it('should render with the city and the translated country name when the consumer is abroad', () => {
      componentRef.setInput('dataConsumerCity', 'Berlin');
      componentRef.setInput('dataConsumerCountry', 'DE');
      componentRef.setInput('isForeignConsumer', true);
      fixture.detectChanges();

      expect(component['countryDisplayName']()).toBe('Deutschland');

      const alert = fixture.debugElement.query(By.directive(AlertComponent));
      expect(alert).not.toBeNull();
      expect(alert.nativeElement.textContent).toContain('Berlin');
      expect(alert.nativeElement.textContent).toContain('Deutschland');
    });
  });

  describe('contract link', () => {
    const contractButton = () => fixture.debugElement.query(By.directive(ButtonComponent));

    it('should not render without a contract revision', () => {
      expect(contractButton()).toBeNull();
    });

    describe('with a contract revision', () => {
      beforeEach(() => {
        componentRef.setInput('contractRevisionId', CONTRACT_REVISION_ID);
        fixture.detectChanges();
      });

      it('should render the link', () => {
        expect(contractButton()).not.toBeNull();
      });

      it('should fetch the PDF for the acting role and open it in a new tab on click', async () => {
        const mockUrl = 'blob:http://localhost/mock-pdf';
        URL.createObjectURL = vi.fn().mockReturnValue(mockUrl);
        URL.revokeObjectURL = vi.fn();
        const openSpy = vi.spyOn(globalThis, 'open').mockImplementation(() => null);
        stateService.__testSignals.actingRole.set(ACTING_ROLES.PRODUCER);

        contractButton().triggerEventHandler('handleClick', null);
        expect(component['downloads'].isOpening(CONTRACT_REVISION_ID)).toBe(true);
        await flushPromises();

        expect(contractRevisionService.getContractRevisionPdf).toHaveBeenCalledWith(
          CONTRACT_REVISION_ID,
          ACTING_ROLES.PRODUCER,
        );
        expect(openSpy).toHaveBeenCalledWith(mockUrl, '_blank', 'noopener');
        expect(component['downloads'].isOpening(CONTRACT_REVISION_ID)).toBe(false);

        openSpy.mockRestore();
      });

      it('should report fetch errors and reset the loading state', async () => {
        const testError = new Error('PDF fetch failed');
        contractRevisionService.getContractRevisionPdf.mockRejectedValueOnce(testError);

        contractButton().triggerEventHandler('handleClick', null);
        await flushPromises();

        expect(errorHandlerService.handleError).toHaveBeenCalledWith(testError);
        expect(component['downloads'].isOpening(CONTRACT_REVISION_ID)).toBe(false);
      });

      it('should fetch only once on a second click while loading', () => {
        contractButton().triggerEventHandler('handleClick', null);
        contractButton().triggerEventHandler('handleClick', null);

        expect(contractRevisionService.getContractRevisionPdf).toHaveBeenCalledTimes(1);
      });
    });
  });
});
