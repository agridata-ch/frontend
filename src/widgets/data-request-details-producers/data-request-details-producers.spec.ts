import { provideHttpClient } from '@angular/common/http';
import { ComponentRef, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Mocked } from 'vitest';

import { DataRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ConsentRequestStateEnum } from '@/entities/openapi';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nService } from '@/shared/i18n';
import {
  createMockAgridataStateService,
  createMockDataRequestService,
  createMockErrorHandlerService,
  MockAgridataStateService,
  MockDataRequestService,
  MockErrorHandlerService,
  mockConsentRequestsPage,
  mockDataRequests,
} from '@/shared/testing/mocks';
import { SortDirections } from '@/shared/ui/agridata-table';

import { DataRequestDetailsProducersComponent } from './data-request-details-producers.component';

describe('DataRequestDetailsProducersComponent', () => {
  let fixture: ComponentFixture<DataRequestDetailsProducersComponent>;
  let component: DataRequestDetailsProducersComponent;
  let componentRef: ComponentRef<DataRequestDetailsProducersComponent>;
  let mockI18nService: Mocked<I18nService>;
  let dataRequestService: MockDataRequestService;
  let stateService: MockAgridataStateService;
  let errorService: MockErrorHandlerService;

  const createComponent = () => {
    fixture = TestBed.createComponent(DataRequestDetailsProducersComponent);
    componentRef = fixture.componentRef;
    component = componentRef.instance;
    componentRef.setInput('dataRequest', mockDataRequests[0]);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    mockI18nService = {
      translate: vi.fn((key: string) => key),
      useObjectTranslation: vi.fn(),
      lang: signal('de'),
    } as unknown as Mocked<I18nService>;
    dataRequestService = createMockDataRequestService();
    stateService = createMockAgridataStateService();
    errorService = createMockErrorHandlerService();

    await TestBed.configureTestingModule({
      imports: [DataRequestDetailsProducersComponent],
      providers: [
        { provide: I18nService, useValue: mockI18nService },
        { provide: DataRequestService, useValue: dataRequestService },
        { provide: AgridataStateService, useValue: stateService },
        { provide: ErrorHandlerService, useValue: errorService },
        provideHttpClient(),
      ],
    }).compileComponents();

    createComponent();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('data loading', () => {
    it('should fetch consent requests for the data request and expose the items', async () => {
      await fixture.whenStable();

      expect(dataRequestService.getConsentRequestsOfDataRequest).toHaveBeenCalledWith(
        mockDataRequests[0].id,
        expect.any(Object),
        stateService.actingRole(),
      );
      expect(component['producersResource'].value().items).toEqual(mockConsentRequestsPage.items);
    });

    it('should forward errors to the error handler', async () => {
      const error = new Error('boom');
      dataRequestService.getConsentRequestsOfDataRequest.mockRejectedValue(error);

      createComponent();
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(errorService.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('reload', () => {
    it('should reload producers and metadata', async () => {
      await fixture.whenStable();
      dataRequestService.getConsentRequestsOfDataRequest.mockClear();
      dataRequestService.fetchProducersMetadata.mockClear();

      component['reloadAll']();
      await fixture.whenStable();

      expect(dataRequestService.getConsentRequestsOfDataRequest).toHaveBeenCalled();
      expect(dataRequestService.fetchProducersMetadata).toHaveBeenCalledWith(
        mockDataRequests[0].id,
      );
    });
  });

  describe('table metadata', () => {
    it('should default-sort by UID ascending', () => {
      const uidColumn = component['tableMetadata']().columns.find(
        (col) => col.sortField === 'dataProducerUid',
      );

      expect(uidColumn?.initialSortDirection).toBe(SortDirections.ASC);
    });

    it('should not show the BUR column by default', () => {
      const burColumn = component['tableMetadata']().columns.find(
        (col) => col.sortField === 'dataProducerBur',
      );

      expect(burColumn).toBeUndefined();
    });

    it('should expose UID, lastChanged and state columns', () => {
      const sortFields = component['tableMetadata']().columns.map((col) => col.sortField);

      expect(sortFields).toEqual(['dataProducerUid', 'lastModifiedDateTime', 'stateCode']);
    });
  });

  describe('row actions', () => {
    const getActions = (stateCode?: ConsentRequestStateEnum) =>
      component['tableMetadata']().rowMenuActions?.({
        id: 'cr-1',
        dataRequestId: mockDataRequests[0].id,
        dataProducerUid: 'CHE123456789',
        stateCode,
      }) ?? [];

    it.each([
      ConsentRequestStateEnum.Granted,
      ConsentRequestStateEnum.Opened,
      ConsentRequestStateEnum.Declined,
    ])('should offer the withdraw action for state %s', (stateCode) => {
      expect(getActions(stateCode).map((action) => action.label)).toContain(
        'data-request.details.producer.withdrawRequest',
      );
    });

    it('should not offer the withdraw action for other states', () => {
      expect(getActions(ConsentRequestStateEnum.Withdrawn)).toHaveLength(0);
    });

    it('should open the withdraw modal for the selected consent request', () => {
      const [withdraw] = getActions(ConsentRequestStateEnum.Granted);

      withdraw.callback();

      expect(component['withdrawOpen']()).toBe(true);
      expect(component['withdrawTarget']()?.id).toBe('cr-1');
    });
  });
});
