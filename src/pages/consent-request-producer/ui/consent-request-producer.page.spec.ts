import { TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

import {
  getToastTitle,
  getToastMessage,
  getToastType,
  ConsentRequestProducerPage,
} from './consent-request-producer.page';
import { ConsentRequestService } from '@shared/services/consent-request.service';
import { ToastService, ToastType } from '@shared/services/toast.service';
import { ConsentRequestDto, ConsentRequestStateEnum } from '@shared/api/openapi/model/models';
import { AgridataTableData } from '@widgets/agridata-table/agridata-table.component';

describe('Pure helper functions', () => {
  it('getToastTitle returns correct titles', () => {
    expect(getToastTitle('GRANTED')).toBe('Einwilligung erteilt');
    expect(getToastTitle('DECLINED')).toBe('Einwilligung abgelehnt');
    expect(getToastTitle('ANY_OTHER')).toBe('Antrag aktualisiert');
  });

  it('getToastMessage returns correct messages', () => {
    expect(getToastMessage('GRANTED', 'MyReq')).toBe(
      'Du hast den Antrag MyReq erfolgreich eingewilligt.',
    );
    expect(getToastMessage('DECLINED', 'XYZ')).toBe(
      'Du hast den Antrag XYZ erfolgreich abgelehnt.',
    );
    expect(getToastMessage('GRANTED')).toBe('Du hast den Antrag  erfolgreich eingewilligt.');
    expect(getToastMessage('UNKNOWN')).toBe('Der Antrag wurde aktualisiert.');
  });

  it('getToastType returns correct ToastType', () => {
    expect(getToastType('GRANTED')).toBe(ToastType.Success);
    expect(getToastType('DECLINED')).toBe(ToastType.Error);
    expect(getToastType('OTHER')).toBe(ToastType.Info);
  });
});

describe('ConsentRequestProducerPage Component', () => {
  let component: ConsentRequestProducerPage;
  let mockConsentService: {
    consentRequests: {
      value: () => ConsentRequestDto[];
      isLoading: () => boolean;
      reload: jest.Mock;
    };
    updateConsentRequestStatus: jest.Mock<Promise<void>, [string, string]>;
  };
  let mockToastService: { show: jest.Mock };
  let locationMock: { go: jest.Mock };
  let reloadSubject: BehaviorSubject<ConsentRequestDto[]>;

  beforeEach(() => {
    reloadSubject = new BehaviorSubject<ConsentRequestDto[]>([]);

    mockConsentService = {
      consentRequests: {
        value: () => reloadSubject.value,
        isLoading: () => false,
        reload: jest.fn(),
      },
      updateConsentRequestStatus: jest.fn().mockResolvedValue(undefined),
    };

    mockToastService = {
      show: jest.fn(),
    };

    locationMock = {
      go: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ConsentRequestProducerPage,
        { provide: ConsentRequestService, useValue: mockConsentService },
        { provide: ToastService, useValue: mockToastService },
        { provide: Location, useValue: locationMock },
      ],
    });

    component = TestBed.inject(ConsentRequestProducerPage);
  });

  it('ngOnInit calls reload()', () => {
    component.ngOnInit();
    expect(mockConsentService.consentRequests.reload).toHaveBeenCalled();
  });

  describe('getFilteredActions()', () => {
    const makeDto = (stateCode: string): ConsentRequestDto => ({
      id: '1',
      stateCode: stateCode as ConsentRequestStateEnum,
      dataRequest: { id: '1', titleDe: 'Title', dataConsumer: { name: 'Consumer' } },
      requestDate: '2025-06-01',
    });

    it('when stateCode is OPENED, returns [details, consent, decline] with correct isMainAction', () => {
      const dto = makeDto('OPENED');
      const actions = component.getFilteredActions(dto);
      expect(actions.map((a) => a.label)).toEqual(['Details', 'Einwilligen', 'Ablehnen']);
      const consent = actions.find((a) => a.label === 'Einwilligen')!;
      expect(consent.isMainAction).toBe(true);
    });

    it('when stateCode is DECLINED, returns [details, consent] without isMainAction', () => {
      const dto = makeDto('DECLINED');
      const actions = component.getFilteredActions(dto);
      expect(actions.map((a) => a.label)).toEqual(['Details', 'Einwilligen']);
      actions.forEach((a) => expect(a.isMainAction).not.toBe(true));
    });

    it('when stateCode is GRANTED, returns [details, decline] without isMainAction', () => {
      const dto = makeDto('GRANTED');
      const actions = component.getFilteredActions(dto);
      expect(actions.map((a) => a.label)).toEqual(['Details', 'Ablehnen']);
      actions.forEach((a) => expect(a.isMainAction).not.toBe(true));
    });

    it('when request is undefined, returns empty array', () => {
      expect(component.getFilteredActions()).toEqual([]);
    });

    it('when stateCode is unrecognized, returns empty array', () => {
      const dto = makeDto('UNKNOWN');
      expect(component.getFilteredActions(dto)).toEqual([]);
    });
  });

  describe('getCellValue()', () => {
    const row: AgridataTableData = {
      data: [
        { header: 'Name', value: 'Alice' },
        { header: 'Age', value: '30' },
      ],
      highlighted: false,
      actions: [],
      rowAction: () => {},
    };

    it('returns matching value for existing header', () => {
      expect(component.getCellValue(row, 'Name')).toBe('Alice');
      expect(component.getCellValue(row, 'Age')).toBe('30');
    });

    it('returns empty string when header not found', () => {
      expect(component.getCellValue(row, 'Nonexistent')).toBe('');
    });
  });

  describe('getStateClasses()', () => {
    it('returns cyan classes for OPENED', () => {
      const classes = component.getStateClasses('OPENED');
      expect(classes).toContain('bg-cyan-100');
      expect(classes).toContain('text-cyan-700');
    });
    it('returns green classes for GRANTED', () => {
      const classes = component.getStateClasses('GRANTED');
      expect(classes).toContain('bg-green-100');
      expect(classes).toContain('text-green-700');
    });
    it('returns red classes for DECLINED', () => {
      const classes = component.getStateClasses('DECLINED');
      expect(classes).toContain('bg-red-100');
      expect(classes).toContain('text-red-700');
    });
    it('returns gray classes for unknown state', () => {
      const classes = component.getStateClasses('XYZ');
      expect(classes).toContain('bg-gray-100');
      expect(classes).toContain('text-gray-800');
    });
  });

  describe('signals: requests and totalOpenRequests', () => {
    const sampleData: ConsentRequestDto[] = [
      {
        id: '1',
        stateCode: 'OPENED',
        dataRequest: { id: '1', dataConsumer: { name: 'dataConsumer One' }, titleDe: 'Title One' },
        requestDate: '2025-06-01',
      },
      {
        id: '2',
        stateCode: 'GRANTED',
        dataRequest: { id: '2', dataConsumer: { name: 'dataConsumer Two' }, titleDe: 'Title Two' },
        requestDate: '2025-06-02',
      },
      {
        id: '3',
        stateCode: 'OPENED',
        dataRequest: {
          id: '3',
          dataConsumer: { name: 'dataConsumer Three' },
          titleDe: 'Title Three',
        },
        requestDate: '2025-06-03',
      },
    ];

    beforeEach(() => {
      reloadSubject.next(sampleData);
    });

    it('computes all requests when no filter is set', () => {
      const rows = component.requests();
      expect(rows.length).toBe(3);
      expect(rows[0].data[0].value).toBe('dataConsumer One');
      expect(component.totalOpenRequests()).toBe(2);
    });

    it('computes filtered requests when stateFilter is set', () => {
      component.setStateFilter('GRANTED');
      const rows = component.requests();
      expect(rows.length).toBe(1);
      expect(rows[0].data[3].value).toBe('GRANTED');
      expect(component.totalOpenRequests()).toBe(2);
    });
  });

  describe('showConsentRequestDetails()', () => {
    it('sets selectedRequest and calls Location.go when pushUrl=true', () => {
      const dto = { id: '1', stateCode: 'OPENED' } as ConsentRequestDto;
      component.showConsentRequestDetails(dto, true);
      expect(component.selectedRequest()).toBe(dto);
      expect(locationMock.go).toHaveBeenCalledWith(`/consent-requests/1`);
    });

    it('sets selectedRequest and does not call Location.go when pushUrl=false', () => {
      const dto = { id: '1', stateCode: 'OPENED' } as ConsentRequestDto;
      component.showConsentRequestDetails(dto, false);
      expect(component.selectedRequest()).toBe(dto);
      expect(locationMock.go).not.toHaveBeenCalled();
    });
  });

  describe('handleOpenDetails()', () => {
    it('does nothing if isLoading() is true', () => {
      jest.spyOn(mockConsentService.consentRequests, 'isLoading').mockReturnValue(true);
      const dto = {
        id: '1',
        stateCode: 'OPENED',
        dataRequest: { dataConsumer: { name: 'dataConsumer One' }, titleDe: 'Title One' },
        requestDate: '2025-06-01',
      } as ConsentRequestDto;
      reloadSubject.next([dto]);
      jest.spyOn(component, 'consentRequestId').mockReturnValue('1');
      component.handleOpenDetails();
      expect(component.selectedRequest()).toBeNull();
      expect(locationMock.go).not.toHaveBeenCalled();
    });

    it('does nothing if consentRequestId returns null or empty', () => {
      const dto = {
        id: '1',
        stateCode: 'OPENED',
        dataRequest: { dataConsumer: { name: 'dataConsumer One' }, titleDe: 'Title One' },
        requestDate: '2025-06-01',
      } as ConsentRequestDto;
      reloadSubject.next([dto]);
      jest.spyOn(component, 'consentRequestId').mockReturnValue('');
      component.handleOpenDetails();
      expect(component.selectedRequest()).toBeNull();
      expect(locationMock.go).not.toHaveBeenCalled();
    });

    it('sets selectedRequest when id matches and does not push URL', () => {
      const dto1 = {
        id: '1',
        stateCode: 'OPENED',
        dataRequest: { dataConsumer: { name: 'dataConsumer One' }, titleDe: 'Title One' },
        requestDate: '2025-06-01',
      } as ConsentRequestDto;
      const dto2 = {
        id: '2',
        stateCode: 'GRANTED',
        dataRequest: { dataConsumer: { name: 'dataConsumer Two' }, titleDe: 'Title Two' },
        requestDate: '2025-06-02',
      } as ConsentRequestDto;
      reloadSubject.next([dto1, dto2]);
      jest.spyOn(component, 'consentRequestId').mockReturnValue('2');
      component.handleOpenDetails();
      expect(component.selectedRequest()).toBe(dto2);
      expect(locationMock.go).not.toHaveBeenCalled();
    });
  });

  describe('updateConsentRequestState()', () => {
    const dto = {
      id: '1',
      stateCode: 'OPENED',
      dataRequest: { dataConsumer: { name: 'dataConsumer One' }, titleDe: 'Title One' },
    } as ConsentRequestDto;

    it('on success, calls reload() and shows success toast', async () => {
      const reloadSpy = mockConsentService.consentRequests.reload;
      await component.updateConsentRequestState(dto.id, 'GRANTED', 'dataConsumer One');
      expect(mockToastService.show).toHaveBeenCalledWith(
        'Einwilligung erteilt',
        'Du hast den Antrag dataConsumer One erfolgreich eingewilligt.',
        ToastType.Success,
      );
      expect(reloadSpy).toHaveBeenCalled();
    });
  });
});
