import { ComponentFixture, TestBed } from '@angular/core/testing';

import { getTranslocoModule } from '@/app/transloco-testing.module';
import { ConsentRequestService } from '@/entities/api';
import {
  ConsentRequestProducerViewDto,
  ConsentRequestProducerViewDtoDataRequestStateCode,
  ConsentRequestStateEnum,
} from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { mockConsentRequestService } from '@/shared/testing/mocks';
import { ToastService } from '@/shared/toast';

import { ConsentRequestTableComponent } from './consent-request-table.component';

describe('ConsentRequestTableComponent', () => {
  let component: ConsentRequestTableComponent;
  let fixture: ComponentFixture<ConsentRequestTableComponent>;
  let mockToastService: jest.Mocked<ToastService>;
  let mockI18nService: jest.Mocked<I18nService>;

  let consentRequestService: ConsentRequestService;
  const mockConsentRequests: ConsentRequestProducerViewDto[] = [
    {
      id: '1',
      stateCode: ConsentRequestStateEnum.Opened,
      requestDate: '2024-03-20',
      dataRequest: {
        title: { de: 'Testanfrage 1' },
        dataConsumerDisplayName: 'Test AG',
        stateCode: ConsentRequestProducerViewDtoDataRequestStateCode.Active,
      },
    },
    {
      id: '2',
      stateCode: ConsentRequestStateEnum.Granted,
      requestDate: '2024-03-19',
      dataRequest: {
        title: { de: 'Testanfrage 2' },
        dataConsumerDisplayName: 'Demo GmbH',
        stateCode: ConsentRequestProducerViewDtoDataRequestStateCode.Active,
      },
    },
  ];

  beforeEach(async () => {
    mockToastService = {
      show: jest.fn(),
    } as unknown as jest.Mocked<ToastService>;

    mockI18nService = {
      translate: jest.fn(),
      useObjectTranslation: jest.fn(),
    } as unknown as jest.Mocked<I18nService>;

    consentRequestService = mockConsentRequestService;
    await TestBed.configureTestingModule({
      imports: [
        ConsentRequestTableComponent,
        getTranslocoModule({
          langs: {
            de: {},
          },
        }),
      ],
      providers: [
        { provide: ToastService, useValue: mockToastService },
        { provide: I18nService, useValue: mockI18nService },
        { provide: ConsentRequestService, useValue: consentRequestService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentRequestTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('consentRequests', mockConsentRequests);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter consent requests by state', () => {
    component.setStateCodeFilter(ConsentRequestStateEnum.Opened);

    expect(component.filteredConsentRequests().length).toBe(1);
    expect(component.filteredConsentRequests()[0].id).toBe('1');
  });

  it('should get correct badge variant for different states', () => {
    expect(component.getBadgeVariant(ConsentRequestStateEnum.Opened)).toBe('info');
    expect(component.getBadgeVariant(ConsentRequestStateEnum.Granted)).toBe('success');
    expect(component.getBadgeVariant(ConsentRequestStateEnum.Declined)).toBe('error');
  });

  it('should emit action when opening details', () => {
    const emitSpy = jest.spyOn(component.tableRowAction, 'emit');
    component.openDetails(mockConsentRequests[0]);

    expect(emitSpy).toHaveBeenCalledWith(mockConsentRequests[0]);
  });

  it('should update consent request state', async () => {
    await component.updateConsentRequestState('1', ConsentRequestStateEnum.Granted, 'Test Request');

    expect(consentRequestService.updateConsentRequestStatus).toHaveBeenCalledWith(
      '1',
      ConsentRequestStateEnum.Granted,
    );
    expect(mockToastService.show).toHaveBeenCalled();
  });

  it('should only show consent action for open requests', () => {
    const openRequestActions = component.getFilteredActions(mockConsentRequests[0]);
    const grantedRequestActions = component.getFilteredActions(mockConsentRequests[1]);

    expect(openRequestActions.length).toBe(1);
    expect(grantedRequestActions.length).toBe(0);
  });

  it('should translate object correctly', () => {
    const translationDto = { de: 'Test', en: 'Test' };
    const i18nServiceSpy = jest.spyOn(mockI18nService, 'useObjectTranslation');

    component.getTranslation(translationDto);

    expect(i18nServiceSpy).toHaveBeenCalledWith(translationDto);
  });

  it('should handle undefined translation object', () => {
    expect(component.getTranslation(undefined)).toBe('');
  });

  it('should prepare undo action correctly', async () => {
    const undoAction = component.prepareUndoAction('1');

    expect(undoAction).toBeDefined();
    await undoAction?.callback();

    expect(consentRequestService.updateConsentRequestStatus).toHaveBeenCalledWith(
      '1',
      ConsentRequestStateEnum.Opened,
    );
    expect(consentRequestService.fetchConsentRequests.reload).toHaveBeenCalled();
  });

  it('should handle error on consent request update', async () => {
    const error = {
      error: {
        message: 'Error message',
        requestId: '123',
      },
    };
    consentRequestService.updateConsentRequestStatus = jest.fn().mockRejectedValue(error);
    mockI18nService.translate.mockReturnValue('Translated error message');

    await component.updateConsentRequestState('1', ConsentRequestStateEnum.Granted, 'Test Request');
    fixture.detectChanges();
    await new Promise(process.nextTick);

    expect(mockToastService.show).toHaveBeenCalledWith(
      'Error message',
      'Translated error message',
      'error',
    );
  });

  it('should get translated state value', () => {
    const i18nServiceSpy = jest.spyOn(mockI18nService, 'translate');

    component.getTranslatedStateValue(ConsentRequestStateEnum.Opened);

    expect(i18nServiceSpy).toHaveBeenCalledWith('consent-request.dataRequest.stateCode.OPENED');
  });

  it('should handle undefined state value', () => {
    expect(component.getTranslatedStateValue(undefined)).toBe('');
  });

  it('should execute action callback correctly', () => {
    const updateSpy = jest.spyOn(component, 'updateConsentRequestState');
    const actions = component.getFilteredActions(mockConsentRequests[0]);
    const action = actions[0];

    action.callback();

    expect(updateSpy).toHaveBeenCalledWith(
      mockConsentRequests[0].id,
      ConsentRequestStateEnum.Granted,
      undefined,
    );
  });
});
