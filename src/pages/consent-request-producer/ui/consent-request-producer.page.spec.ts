import { TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';

import {
  ConsentRequestProducerPage,
  getToastTitle,
  getToastMessage,
  getToastType,
} from './consent-request-producer.page';
import { ConsentRequestService } from '@shared/services/consent-request.service';
import { ToastService, ToastType } from '@shared/services/toast.service';
import { ConsentRequestDto, ConsentRequestStateEnum } from '@shared/api/openapi/model/models';
import { AgridataTableData } from '@widgets/agridata-table/agridata-table.component';

describe('ConsentRequestProducerPage - pure toast helpers', () => {
  it('getToastTitle returns correct titles', () => {
    expect(getToastTitle(ConsentRequestStateEnum.Granted)).toBe('Einwilligung erteilt');
    expect(getToastTitle(ConsentRequestStateEnum.Declined)).toBe('Einwilligung abgelehnt');
    expect(getToastTitle('SOMETHING_ELSE')).toBe('Antrag aktualisiert');
  });

  it('getToastMessage returns correct messages', () => {
    const name = 'Test Antrag';
    expect(getToastMessage(ConsentRequestStateEnum.Granted, name)).toBe(
      `Du hast den Antrag ${name} erfolgreich eingewilligt.`,
    );
    expect(getToastMessage(ConsentRequestStateEnum.Declined, name)).toBe(
      `Du hast den Antrag ${name} erfolgreich abgelehnt.`,
    );
    expect(getToastMessage(ConsentRequestStateEnum.Granted)).toBe(
      'Du hast den Antrag  erfolgreich eingewilligt.',
    );
    expect(getToastMessage('UNKNOWN_STATE')).toBe('Der Antrag wurde aktualisiert.');
  });

  it('getToastType returns correct ToastType', () => {
    expect(getToastType(ConsentRequestStateEnum.Granted)).toBe(ToastType.Success);
    expect(getToastType(ConsentRequestStateEnum.Declined)).toBe(ToastType.Error);
    expect(getToastType('WHATEVER')).toBe(ToastType.Info);
  });
});

describe('ConsentRequestProducerPage - component behavior', () => {
  let component: ConsentRequestProducerPage;
  let mockConsentService: {
    fetchConsentRequests: jest.Mock<Promise<ConsentRequestDto[]>, []>;
    updateConsentRequestStatus: jest.Mock<Promise<void>, [string, string]>;
  };
  let mockToastService: { show: jest.Mock<void, [string, string, ToastType]> };
  let mockLocation: { go: jest.Mock<void, [string]> };

  const sampleRequests: ConsentRequestDto[] = [
    {
      id: '1',
      stateCode: ConsentRequestStateEnum.Opened,
      requestDate: '2025-05-01',
      dataRequest: { dataConsumer: { name: 'Alice' }, titleDe: 'Antrag A' },
    } as ConsentRequestDto,
    {
      id: '2',
      stateCode: ConsentRequestStateEnum.Granted,
      requestDate: '2025-05-02',
      dataRequest: { dataConsumer: { name: 'Bob' }, titleDe: 'Antrag B' },
    } as ConsentRequestDto,
    {
      id: '3',
      stateCode: ConsentRequestStateEnum.Declined,
      requestDate: '2025-05-03',
      dataRequest: { dataConsumer: { name: 'Charlie' }, titleDe: 'Antrag C' },
    } as ConsentRequestDto,
  ];

  beforeEach(async () => {
    mockConsentService = {
      fetchConsentRequests: jest.fn().mockResolvedValue(sampleRequests),
      updateConsentRequestStatus: jest.fn(),
    };
    mockToastService = {
      show: jest.fn(),
    };
    mockLocation = {
      go: jest.fn(),
    };

    await TestBed.configureTestingModule({
      providers: [
        ConsentRequestProducerPage,
        { provide: ConsentRequestService, useValue: mockConsentService },
        { provide: ToastService, useValue: mockToastService },
        { provide: Location, useValue: mockLocation },
      ],
    }).compileComponents();

    component = TestBed.inject(ConsentRequestProducerPage);
  });

  // Helper to flush pending Promise microtasks
  function flushPromises(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  it('getFilteredActions returns [] when request is undefined', () => {
    const actions = component.getFilteredActions();
    expect(actions).toEqual([]);
  });

  it('getFilteredActions returns correct actions for state=Opened', () => {
    const req = sampleRequests[0]; // stateCode = Opened
    const actions = component.getFilteredActions(req);
    expect(actions.length).toBe(3);

    const [details, consent, decline] = actions;
    expect(details.label).toBe('Details');
    expect(typeof details.callback).toBe('function');

    expect(consent.label).toBe('Einwilligen');
    expect(consent.isMainAction).toBe(true);

    expect(decline.label).toBe('Ablehnen');
  });

  it('getFilteredActions returns correct actions for state=Declined', () => {
    const req = sampleRequests[2]; // stateCode = Declined
    const actions = component.getFilteredActions(req);
    expect(actions.length).toBe(2);

    const [details, consent] = actions;
    expect(details.label).toBe('Details');
    expect(consent.label).toBe('Einwilligen');
    expect(consent.isMainAction).toBe(false);
  });

  it('getFilteredActions returns correct actions for state=Granted', () => {
    const req = sampleRequests[1]; // stateCode = Granted
    const actions = component.getFilteredActions(req);
    expect(actions.length).toBe(2);

    const [details, decline] = actions;
    expect(details.label).toBe('Details');
    expect(decline.label).toBe('Ablehnen');
  });

  it('getCellValue returns correct cell value or empty string', () => {
    const row: AgridataTableData = {
      data: [
        { header: 'Key1', value: 'Val1' },
        { header: 'Key2', value: 'Val2' },
      ],
      highlighted: false,
      actions: [],
      rowAction: () => {},
    };
    expect(component.getCellValue(row, 'Key1')).toBe('Val1');
    expect(component.getCellValue(row, 'NonExistent')).toBe('');
  });

  it('setStateFilter updates stateFilter and filters requests accordingly', async () => {
    // Wait for resource loader to populate consentRequestResult
    await flushPromises();

    // Initially: stateFilter is null → requests includes all three
    let tableData = component.requests();
    expect(tableData.length).toBe(3);

    // totalOpenRequests should count only state Opened → 1
    expect(component.totalOpenRequests()).toBe(1);

    // Apply filter to "Granted"
    component.setStateFilter(ConsentRequestStateEnum.Granted);
    tableData = component.requests();
    expect(tableData.length).toBe(1);
    // That one entry should have state "Granted"
    const onlyRow = tableData[0];
    expect(component.getCellValue(onlyRow, 'Status')).toBe(ConsentRequestStateEnum.Granted);

    // totalOpenRequests unaffected by filter: always counts from full result
    expect(component.totalOpenRequests()).toBe(1);
  });

  it('showConsentRequestDetails sets selectedRequest and calls location.go when pushUrl=true', async () => {
    const req = sampleRequests[0];
    expect(component.selectedRequest()).toBeNull();

    component.showConsentRequestDetails(req, true);
    expect(component.selectedRequest()).toBe(req);
    expect(mockLocation.go).toHaveBeenCalledWith(`/consent-requests/${req.id}`);
  });

  it('showConsentRequestDetails does not call location.go when pushUrl=false', () => {
    const req = sampleRequests[1];
    component.showConsentRequestDetails(req, false);
    expect(component.selectedRequest()).toBe(req);
    expect(mockLocation.go).not.toHaveBeenCalled();
  });

  describe('updateConsentRequestState - success', () => {
    beforeEach(async () => {
      // Spy on reload()
      jest.spyOn(component.consentRequestResult, 'reload').mockImplementation(() => true);
      // Stub updateConsentRequestStatus to resolve
      mockConsentService.updateConsentRequestStatus.mockResolvedValue();
      await flushPromises();
    });

    it('calls toastService.show and reloads resource on success', async () => {
      const req = sampleRequests[0];
      const state = ConsentRequestStateEnum.Granted;
      const requestName = req.dataRequest?.titleDe;

      component.updateConsentRequestState(req.id, state, requestName);
      // Wait for Promise chain to run
      await flushPromises();

      expect(mockToastService.show).toHaveBeenCalledWith(
        getToastTitle(state),
        getToastMessage(state, requestName),
        getToastType(state),
      );
      expect(component.consentRequestResult.reload).toHaveBeenCalled();
    });
  });

  describe('updateConsentRequestState - failure', () => {
    const fakeError = {
      error: { message: 'ErrText', requestId: 'XYZ123' },
    };

    beforeEach(async () => {
      jest.spyOn(component.consentRequestResult, 'reload').mockImplementation(() => true);
      // Make updateConsentRequestStatus reject with shaped error

      mockConsentService.updateConsentRequestStatus.mockRejectedValue(fakeError);
      await flushPromises();
    });

    it('shows error toast with error details when update fails', async () => {
      const req = sampleRequests[2];
      const state = ConsentRequestStateEnum.Declined;

      component.updateConsentRequestState(req.id, state, req.dataRequest?.titleDe);
      await flushPromises();

      expect(mockToastService.show).toHaveBeenCalledWith(
        fakeError.error.message,
        `Fehler beim Aktualisieren des Antrags. RequestId: ${fakeError.error.requestId}`,
        ToastType.Error,
      );
    });
  });
});
