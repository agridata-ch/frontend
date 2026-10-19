import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { ComponentRef, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { Mocked } from 'vitest';

import { DataRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ExceptionEnum } from '@/entities/openapi';
import { ACTING_ROLES } from '@/shared/constants/constants';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nService } from '@/shared/i18n';
import {
  createMockAgridataStateService,
  createMockDataRequestService,
  createMockErrorHandlerService,
  createMockToastService,
  MockAgridataStateService,
  MockDataRequestService,
  MockErrorHandlerService,
  MockToastService,
  mockConsentRequestStatusSummary,
  mockDataRequests,
} from '@/shared/testing/mocks';
import { ToastService, ToastType } from '@/shared/toast';
import { ButtonComponent } from '@/shared/ui/button';

import { DataRequestDetailsProducersMetadataComponent } from './data-request-details-producers-metadata.component';

describe('DataRequestDetailsProducersMetadataComponent', () => {
  let fixture: ComponentFixture<DataRequestDetailsProducersMetadataComponent>;
  let component: DataRequestDetailsProducersMetadataComponent;
  let componentRef: ComponentRef<DataRequestDetailsProducersMetadataComponent>;
  let mockI18nService: Mocked<I18nService>;
  let dataRequestService: MockDataRequestService;
  let errorService: MockErrorHandlerService;
  let stateService: MockAgridataStateService;
  let toastService: MockToastService;

  const flushPromises = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

  const createComponent = () => {
    fixture = TestBed.createComponent(DataRequestDetailsProducersMetadataComponent);
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
    errorService = createMockErrorHandlerService();
    stateService = createMockAgridataStateService();
    toastService = createMockToastService();

    await TestBed.configureTestingModule({
      imports: [DataRequestDetailsProducersMetadataComponent],
      providers: [
        { provide: I18nService, useValue: mockI18nService },
        { provide: DataRequestService, useValue: dataRequestService },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: AgridataStateService, useValue: stateService },
        { provide: ToastService, useValue: toastService },
        provideHttpClient(),
      ],
    }).compileComponents();

    createComponent();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('data loading', () => {
    it('should fetch the metadata for the given data request id', async () => {
      await fixture.whenStable();

      expect(dataRequestService.fetchProducersMetadata).toHaveBeenCalledWith('1');
    });

    it('should refetch the metadata on reload', async () => {
      await fixture.whenStable();
      dataRequestService.fetchProducersMetadata.mockClear();

      component.reload();
      await fixture.whenStable();

      expect(dataRequestService.fetchProducersMetadata).toHaveBeenCalledWith('1');
    });

    it('should forward errors to the error handler', async () => {
      const error = new Error('boom');
      dataRequestService.fetchProducersMetadata.mockRejectedValue(error);

      createComponent();
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(errorService.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('columns', () => {
    it('should map each state to its UID and BUR counts with Swiss grouping', async () => {
      await fixture.whenStable();

      const columns = component['columns']();

      expect(columns.map((c) => c.labelKey)).toEqual([
        'total',
        'open',
        'granted',
        'declined',
        'withdrawn',
      ]);
      // 1562 -> "1'562": grouped, not the raw number (separator char varies by ICU build).
      expect(columns[0].uid).toMatch(/1.562/);
      expect(columns[0].uid).not.toBe('1562');
      expect(columns[0].bur).toMatch(/2.536/);
      expect(columns[2].uid).toBe('978');
    });
  });

  describe('BUR visibility', () => {
    it('should expose BUR when the summary has a bur block', async () => {
      await fixture.whenStable();

      expect(component['hasBur']()).toBe(true);
    });

    it('should hide BUR when the summary has no bur block', async () => {
      dataRequestService.fetchProducersMetadata.mockResolvedValue({
        uid: mockConsentRequestStatusSummary.uid,
      });

      createComponent();
      await fixture.whenStable();

      expect(component['hasBur']()).toBe(false);
    });
  });

  describe('CSV export', () => {
    const clickExport = () =>
      fixture.debugElement
        .query(By.directive(ButtonComponent))
        .triggerEventHandler('handleClick', null);

    it('should export for the acting role and download it under the translated file name', async () => {
      const csv = new Blob(['uid;bur'], { type: 'text/csv' });
      dataRequestService.exportConsentRequests.mockResolvedValueOnce(csv);
      stateService.__testSignals.actingRole.set(ACTING_ROLES.CONSUMER);
      URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-csv');
      URL.revokeObjectURL = vi.fn();
      let downloadedFileName = '';
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
        this: HTMLAnchorElement,
      ) {
        downloadedFileName = this.download;
      });

      clickExport();
      expect(component['isExporting']()).toBe(true);
      await flushPromises();

      expect(dataRequestService.exportConsentRequests).toHaveBeenCalledWith(
        '1',
        ACTING_ROLES.CONSUMER,
      );
      expect(mockI18nService.translate).toHaveBeenCalledWith(
        'data-request.details.producer.metadata.export.fileName',
        { humanFriendlyId: 'REQ-001' },
      );
      expect(URL.createObjectURL).toHaveBeenCalledWith(csv);
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(downloadedFileName).toBe('data-request.details.producer.metadata.export.fileName.csv');
      expect(toastService.show).not.toHaveBeenCalled();
      expect(component['isExporting']()).toBe(false);

      clickSpy.mockRestore();
    });

    it.each([
      ['limitExceeded', 400, ExceptionEnum.ExportLimitExceeded],
      ['capacityExhausted', 503, ExceptionEnum.ExportCapacityExhausted],
    ])('should show the %s error toast', async (key, status, type) => {
      dataRequestService.exportConsentRequests.mockRejectedValueOnce(
        // CSV requests use responseType 'text', so the backend error arrives as a JSON string.
        new HttpErrorResponse({ status, error: JSON.stringify({ type, requestId: 'req-1' }) }),
      );

      clickExport();
      await flushPromises();

      expect(toastService.show).toHaveBeenCalledWith(
        'data-request.details.producer.metadata.export.error.title',
        `data-request.details.producer.metadata.export.error.${key}`,
        ToastType.Error,
      );
      expect(component['isExporting']()).toBe(false);
    });

    it.each([
      [
        'other backend errors',
        new HttpErrorResponse({
          status: 500,
          url: '/export',
          error: JSON.stringify({ type: ExceptionEnum.UidMissing, requestId: 'req-1' }),
        }),
      ],
      ['non-HTTP errors', new Error('network')],
    ])(
      'should show the generic error toast with the error message for %s',
      async (_label, error) => {
        dataRequestService.exportConsentRequests.mockRejectedValueOnce(error);

        clickExport();
        await flushPromises();

        expect(mockI18nService.translate).toHaveBeenCalledWith(
          'data-request.details.producer.metadata.export.error.generic',
          { error: error.message },
        );
        expect(toastService.show).toHaveBeenCalledWith(
          'data-request.details.producer.metadata.export.error.title',
          'data-request.details.producer.metadata.export.error.generic',
          ToastType.Error,
        );
      },
    );
  });
});
